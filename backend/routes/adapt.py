from flask import Blueprint, request, jsonify, current_app
from gemini_service import build_adapt_prompt, call_gemini

adapt_bp = Blueprint("adapt", __name__)


@adapt_bp.route("/adapt_learning", methods=["POST"])
def adapt_learning():
    """
    POST /adapt_learning
    Body:
    {
        "session_id": "required"
    }
    Automatically uses last_evaluation from session to drive adaptation.
    """
    data = request.get_json(force=True)
    sessions = current_app.config["SESSIONS"]

    session_id = data.get("session_id")
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or missing session_id."}), 400

    session = sessions[session_id]
    profile = session.get("profile", {})
    plan = session.get("plan", {})
    evaluation = session.get("last_evaluation")

    if not evaluation:
        return jsonify({"error": "No evaluation found. Run /evaluate with submit_answers first."}), 400

    weak_areas = evaluation.get("weak_areas", [])
    improvement_suggestions = evaluation.get("improvement_suggestions", [])

    prompt = build_adapt_prompt(profile, plan, weak_areas, improvement_suggestions)
    adapted = call_gemini(prompt)

    if "error" in adapted:
        return jsonify(adapted), 500

    # Update session plan with the adapted plan
    sessions[session_id]["plan"] = {
        **plan,
        "study_plan": adapted.get("adapted_study_plan", {}),
    }
    sessions[session_id]["adapted"] = adapted

    return jsonify({
        "session_id": session_id,
        "adapted_plan": adapted,
    }), 200
