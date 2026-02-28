import uuid
import json
from flask import Blueprint, request, jsonify, current_app
from crawler_service import crawl_topic, extract_text_from_pdf, extract_text_from_raw
from rag_service import ingest_text, retrieve_context
from data_loader import retrieve_cl_context
from gemini_service import call_gemini

resources_bp = Blueprint("resources", __name__)


# ── /upload_resource ──────────────────────────────────────────────────────

@resources_bp.route("/upload_resource", methods=["POST"])
def upload_resource():
    """
    Accepts multipart/form-data with:
      - session_id (form field, optional)
      - file       (PDF or .txt)
    OR JSON with:
      - session_id (optional)
      - text       (raw pasted text)

    Ingests content into session RAG store and runs metadata extraction.
    """
    sessions = current_app.config["SESSIONS"]
    session_id = (request.form.get("session_id") or
                  (request.get_json(silent=True) or {}).get("session_id") or
                  str(uuid.uuid4()))

    if session_id not in sessions:
        sessions[session_id] = {}

    raw_text = ""

    # ── PDF / file upload ──
    if "file" in request.files:
        f = request.files["file"]
        filename = f.filename or ""
        file_bytes = f.read()
        if filename.lower().endswith(".pdf"):
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

    # ── Plain text body ──
    elif request.is_json:
        data = request.get_json(force=True)
        raw_text = extract_text_from_raw(data.get("text", ""))
        session_id = data.get("session_id", session_id)

    if not raw_text.strip():
        return jsonify({"error": "No extractable text found in the uploaded resource."}), 400

    # Ingest into per-session RAG store
    chunks = ingest_text(session_id, raw_text, source="upload")

    # Auto extract academic metadata from the uploaded content
    metadata = _extract_metadata(raw_text[:6000])

    sessions[session_id]["resource_text"] = raw_text[:20000]
    sessions[session_id]["extracted_metadata"] = metadata

    return jsonify({
        "session_id": session_id,
        "chunks_indexed": chunks,
        "extracted_metadata": metadata,
    }), 200


# ── /crawl_topic ──────────────────────────────────────────────────────────

@resources_bp.route("/crawl_topic", methods=["POST"])
def crawl_topic_route():
    """
    POST /crawl_topic
    Body: { "session_id": "...", "subject": "DBMS", "topics": ["Normalization", "SQL"] }
    Crawls educational sites and ingests content into RAG store.
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id") or str(uuid.uuid4())
    subject = data.get("subject", "")
    topics = data.get("topics", [])

    if not subject or not topics:
        return jsonify({"error": "subject and topics are required"}), 400

    if session_id not in sessions:
        sessions[session_id] = {}

    crawl_results = crawl_topic(subject, topics)

    total_chunks = 0
    sources_found = []
    for topic, info in crawl_results.items():
        if info.get("text"):
            count = ingest_text(session_id, info["text"], source=f"web_{topic}")
            total_chunks += count
            sources_found.append({"topic": topic, "url": info["url"], "chunks": count})

    sessions[session_id]["crawled_sources"] = sources_found

    return jsonify({
        "session_id": session_id,
        "sources_found": sources_found,
        "total_chunks_indexed": total_chunks,
    }), 200


# ── /extract_metadata ────────────────────────────────────────────────────

@resources_bp.route("/extract_metadata", methods=["POST"])
def extract_metadata_route():
    """
    POST /extract_metadata
    Body: { "session_id": "...", "text": "..." }
    Uses Gemini to extract semester, branch, subjects from any text.
    Also enriches with CL scheme data from the pre-loaded RAG store.
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id") or str(uuid.uuid4())
    text = data.get("text", "")

    # If no text provided, use already-stored resource text
    if not text and session_id in sessions:
        text = sessions[session_id].get("resource_text", "")

    if not text:
        return jsonify({"error": "No text to extract metadata from"}), 400

    if session_id not in sessions:
        sessions[session_id] = {}

    metadata = _extract_metadata(text[:6000])
    sessions[session_id]["extracted_metadata"] = metadata

    return jsonify({
        "session_id": session_id,
        "metadata": metadata,
    }), 200


# ── /get_cl_context ──────────────────────────────────────────────────────

@resources_bp.route("/get_cl_context", methods=["POST"])
def get_cl_context():
    """
    POST /get_cl_context
    Body: { "query": "semester 5 subjects syllabus" }
    Returns relevant context from the pre-loaded CL scheme PDF.
    """
    data = request.get_json(force=True)
    query = data.get("query", "CL branch full syllabus all semesters")
    context = retrieve_cl_context(query, top_k=8)

    # Use Gemini to parse the raw context into structured JSON
    prompt = f"""
You are a syllabus parser. Extract ALL academic information from the text below.

TEXT:
{context}

Return ONLY valid JSON:
{{
  "branch": "CL",
  "semesters": {{
    "1": {{ "subjects": ["Sub1", "Sub2"], "syllabus_summary": "brief" }},
    "2": {{ ... }},
    ...
  }},
  "total_semesters": 8
}}
"""
    result = call_gemini(prompt)
    return jsonify({"cl_scheme": result, "raw_context": context[:2000]}), 200


# ── Internal helper ───────────────────────────────────────────────────────

def _extract_metadata(text: str) -> dict:
    """Use Gemini to extract semester, branch, subjects from raw text."""
    # Enrich with CL scheme context if available
    cl_context = retrieve_cl_context(
        "semester subjects branch scheme syllabus", top_k=4
    )

    prompt = f"""
You are an academic data extractor.

Analyze the following text (which may be a syllabus, timetable, marksheet, or notes)
and extract as much structured academic information as possible.

UPLOADED TEXT:
{text}

INSTITUTIONAL SCHEME REFERENCE (CL Branch):
{cl_context[:2000] if cl_context else "Not available"}

Return ONLY valid JSON:
{{
  "semester": "5",
  "branch": "CL",
  "subjects": ["DBMS", "OS", "CN", "SE", "TOC"],
  "study_hours_suggestion": 4,
  "confidence_defaults": {{
    "DBMS": "medium",
    "OS": "low"
  }},
  "syllabus_summary": {{
    "DBMS": "Unit 1: ER Model, SQL\\nUnit 2: Normalization",
    "OS": "..."
  }},
  "detected_from": "uploaded_document"
}}

If a field cannot be determined, use null.
"""
    return call_gemini(prompt)
