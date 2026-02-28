from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_plan_prompt, call_gemini
from rag_service import retrieve_context
from data_loader import retrieve_cl_context

plan_bp = Blueprint("plan", __name__)


@plan_bp.route("/generate_plan", methods=["POST"])
def generate_plan():
    """
    POST /generate_plan
    Body:
    {
        "session_id": "required",
        "plan_days": 7   // optional, defaults to 7
    }
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id")
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or missing session_id. Run /analyze_student first."}), 400

    session = sessions[session_id]
    profile = session.get("profile", {})
    analysis = session.get("analysis", {})
    plan_days = data.get("plan_days", 7)

    # Retrieve RAG context for study-plan generation
    weak_subs = " ".join(analysis.get("weak_subjects", []))
    topics = " ".join(analysis.get("important_topics", [])[:5])
    query = f"study plan notes {weak_subs} {topics}"
    session_ctx = retrieve_context(session_id, query, top_k=4)
    cl_ctx = retrieve_cl_context(query, top_k=3)
    rag_context = "\n\n".join(filter(None, [cl_ctx, session_ctx]))

    prompt = build_plan_prompt(profile, analysis, plan_days, rag_context=rag_context)
    plan = call_gemini(prompt)

    if "error" in plan:
        return jsonify(plan), 500

    sessions[session_id]["plan"] = plan

    return jsonify({
        "session_id": session_id,
        "plan": plan,
    }), 200
