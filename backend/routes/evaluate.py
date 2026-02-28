from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_quiz_prompt, build_evaluate_prompt, call_gemini
from rag_service import retrieve_context
from data_loader import retrieve_cl_context

evaluate_bp = Blueprint("evaluate", __name__)


@evaluate_bp.route("/evaluate", methods=["POST"])
def evaluate():
    """
    POST /evaluate
    Two modes:
      1. Generate quiz:   { "session_id": "...", "action": "generate_quiz", "topic": "SQL", "subject": "DBMS", "difficulty": "medium", "count": 5 }
      2. Submit answers:  { "session_id": "...", "action": "submit_answers", "topic": "SQL", "subject": "DBMS",
                            "student_answers": [{"question": "...", "answer": "..."}] }
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id")
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or missing session_id. Run /analyze_student first."}), 400

    action = data.get("action", "generate_quiz")
    topic = data.get("topic", "")
    subject = data.get("subject", "")

    if action == "generate_quiz":
        difficulty = data.get("difficulty", "medium")
        count = data.get("count", 5)

        # Retrieve RAG Context
        query = f"quiz questions {subject} {topic}"
        session_ctx = retrieve_context(session_id, query, top_k=3)
        cl_ctx = retrieve_cl_context(query, top_k=3)
        rag_context = "\n\n".join(filter(None, [cl_ctx, session_ctx]))

        prompt = build_quiz_prompt(topic, subject, difficulty, count, rag_context=rag_context)
        result = call_gemini(prompt)

    elif action == "submit_answers":
        student_answers = data.get("student_answers", [])
        if not student_answers:
            return jsonify({"error": "student_answers are required for submit_answers action"}), 400
        prompt = build_evaluate_prompt(topic, subject, student_answers)
        result = call_gemini(prompt)
        if "error" not in result:
            # Store evaluation in session for adapt_learning
            sessions[session_id]["last_evaluation"] = result
    else:
        return jsonify({"error": f"Unknown action: {action}"}), 400

    if "error" in result:
        return jsonify(result), 500

    return jsonify({
        "session_id": session_id,
        "action": action,
        "result": result,
    }), 200
