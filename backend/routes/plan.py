from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_plan_prompt, call_gemini
from rag_service import retrieve_context
from data_loader import retrieve_cl_context
from database import get_db_connection

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

    # 1. Blueprint Alignment: Mathematical Priority Engine (Deterministic)
    mathematical_weights = {}
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            SELECT t.topic_name, t.priority, l.attempt_count, l.last_score, l.revision_priority 
            FROM topics t
            LEFT JOIN learning_state l ON t.id = l.topic_id
        ''')
        rows = c.fetchall()
        for row in rows:
            # Mathematical algorithm: revision_priority * weakness_multiplier
            # weakness_multiplier = (11 - score) meaning lower score -> higher multiplier
            req_score = row["last_score"] if row["last_score"] is not None else 0
            rev_pri = row["revision_priority"] if row["revision_priority"] is not None else 1.0
            
            calculated_weight = rev_pri * (11 - req_score)
            mathematical_weights[row["topic_name"]] = round(calculated_weight, 2)
            
        conn.close()
    except Exception as e:
        print(f"[DB] Error calculating planner weights: {e}")
        
    # Inject deterministic weights into the Prompt context to prove Technical Ownership
    analysis["mathematical_topic_weights"] = mathematical_weights

    # 2. Tagged RAG Context mapping specifically 'planner' mode
    # For Planner, we want high exam_relevance across any active subjects
    subjects_to_scan = analysis.get("weak_subjects", []) + analysis.get("strong_subjects", [])
    subject_filter = subjects_to_scan[0] if subjects_to_scan else "General" 
    
    query = f"study plan notes focus {subject_filter}"
    session_ctx = retrieve_context(session_id, query, mode="planner", filter_subject=subject_filter, top_k=4)
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
