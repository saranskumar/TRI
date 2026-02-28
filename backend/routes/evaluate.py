from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_quiz_prompt, build_evaluate_prompt, call_gemini
from rag_service import retrieve_context
from data_loader import retrieve_cl_context
from database import get_db_connection
import uuid

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

        # Tagged RAG Context mapping specifically 'quiz' mode
        query = f"quiz questions {subject} {topic}"
        session_ctx = retrieve_context(session_id, query, mode="quiz", filter_topic=topic, top_k=3)
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
            sessions[session_id]["last_evaluation"] = result
            
            # Blueprint Alignment: Log deterministic memory to SQLite
            try:
                conn = get_db_connection()
                c = conn.cursor()
                
                # Assume topic name maps roughly to ID for MVP tracking
                topic_id = topic.lower().replace(" ", "_")
                
                # Extract score out of 10 from Gemini response
                # Gemini should ideally return a structured score. Defaulting to 0 if parsing fails.
                score = result.get("score", 0) 
                
                # Insert Evaluation
                eval_id = str(uuid.uuid4())
                c.execute('''
                    INSERT INTO quiz_evaluations (id, topic_id, score, ai_feedback)
                    VALUES (?, ?, ?, ?)
                ''', (eval_id, topic_id, score, str(result.get("weak_areas", "[]"))))
                
                # Update Learning Matrix
                c.execute('''
                    INSERT INTO learning_state (topic_id, attempt_count, last_score)
                    VALUES (?, 1, ?)
                    ON CONFLICT(topic_id) DO UPDATE SET 
                        attempt_count = attempt_count + 1,
                        last_score = excluded.last_score,
                        revision_priority = CASE WHEN excluded.last_score < 6 THEN revision_priority * 1.5 ELSE revision_priority * 0.8 END
                ''', (topic_id, score))
                
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[DB] Error saving evaluation: {e}")

    else:
        return jsonify({"error": f"Unknown action: {action}"}), 400

    if "error" in result:
        return jsonify(result), 500

    return jsonify({
        "session_id": session_id,
        "action": action,
        "result": result,
    }), 200
