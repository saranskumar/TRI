import uuid
from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_analyze_prompt, call_gemini
from rag_service import retrieve_context
from data_loader import retrieve_cl_context, SHARED_COLLECTION

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze_student", methods=["POST"])
def analyze_student():
    """
    POST /analyze_student
    Body:
    {
        "session_id": "optional — new one created if missing",
        "profile": {
            "semester": "5",
            "subjects": ["DBMS", "OS", "CN"],
            "study_hours": 4,
            "confidence": {"DBMS": "medium", "OS": "low", "CN": "high"}
        },
        "marks": {
            "DBMS": {"internal": 35, "assignment": 8, "previous_exam": 60},
            ...
        },
        "syllabus": "Unit 1: ER Model... Unit 2: SQL...",
        "pyqs": "2023: What is normalization? 2022: Explain ACID properties..."
    }
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id") or str(uuid.uuid4())
    profile = data.get("profile", {})
    marks = data.get("marks", {})
    syllabus = data.get("syllabus", "")
    pyqs = data.get("pyqs", "")

    if not profile or not marks:
        return jsonify({"error": "profile and marks are required"}), 400

    # Retrieve RAG context: merge per-session uploads + shared CL scheme
    query = f"{profile.get('semester', '')} semester {' '.join(profile.get('subjects', []))} syllabus"
    session_ctx = retrieve_context(session_id, query, top_k=4)
    cl_ctx = retrieve_cl_context(query, top_k=4)
    rag_context = "\n\n".join(filter(None, [cl_ctx, session_ctx]))

    prompt = build_analyze_prompt(profile, marks, syllabus, pyqs, rag_context=rag_context)
    analysis = call_gemini(prompt)


    if "error" in analysis:
        return jsonify(analysis), 500

    # Store in session
    sessions[session_id] = {
        "profile": profile,
        "marks": marks,
        "syllabus": syllabus,
        "pyqs": pyqs,
        "analysis": analysis,
    }

    return jsonify({
        "session_id": session_id,
        "analysis": analysis,
    }), 200
