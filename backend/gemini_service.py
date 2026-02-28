import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


def call_gemini(prompt: str) -> dict:
    """Call Gemini API and parse the JSON response."""
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.4,
                max_output_tokens=8192,
            ),
        )
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response as JSON", "raw": response.text}
    except Exception as e:
        return {"error": str(e)}


# ──────────────────────────────────────────────
# PROMPT BUILDERS  (one per functional engine)
# ──────────────────────────────────────────────

def _rag_block(context: str) -> str:
    """Format RAG context as a knowledge block for injection into prompts."""
    if not context or not context.strip():
        return ""
    return f"""
--- RETRIEVED KNOWLEDGE BASE (use this as authoritative reference) ---
{context.strip()}
--- END KNOWLEDGE BASE ---
"""


def build_analyze_prompt(profile: dict, marks: dict, syllabus: str, pyqs: str, rag_context: str = "") -> str:
    return f"""
You are TRI — an intelligent AI Academic Mentor Agent.

Analyze the following student data and return a comprehensive academic analysis.
{_rag_block(rag_context)}
STUDENT PROFILE:
- Semester: {profile.get('semester')}
- Subjects: {', '.join(profile.get('subjects', []))}
- Daily Study Hours: {profile.get('study_hours')} hrs
- Confidence Levels: {json.dumps(profile.get('confidence', {}))}

INTERNAL/EXTERNAL MARKS:
{json.dumps(marks, indent=2)}

SYLLABUS:
{syllabus}

PREVIOUS YEAR QUESTIONS (PYQs):
{pyqs}

Return ONLY a valid JSON object with this exact structure:
{{
  "important_topics": ["topic1", "topic2", ...],
  "high_weightage_concepts": {{"subject": ["concept1", ...]}},
  "pyq_focus_areas": ["area1", "area2", ...],
  "strong_subjects": ["sub1", ...],
  "weak_subjects": ["sub1", ...],
  "learning_gaps": {{"subject": ["gap1", ...]}},
  "weakness_reasons": {{
    "subject": {{
      "reason": "explanation",
      "root_cause": "conceptual_misunderstanding | lack_of_practice | poor_revision | time_management"
    }}
  }},
  "overall_readiness_score": 0
}}
"""



def build_plan_prompt(profile: dict, analysis: dict, plan_days: int = 7, rag_context: str = "") -> str:
    return f"""
You are TRI — an AI Academic Planner.

Using the student profile and academic analysis, generate a fully personalized {plan_days}-day study plan.
{_rag_block(rag_context)}
STUDENT PROFILE:
- Subjects: {', '.join(profile.get('subjects', []))}
- Daily Study Hours: {profile.get('study_hours')} hrs
- Weak Subjects: {', '.join(analysis.get('weak_subjects', []))}
- Important Topics: {', '.join(analysis.get('important_topics', []))}
- Learning Gaps: {json.dumps(analysis.get('learning_gaps', {}))}

Return ONLY a valid JSON object with this exact structure:
{{
  "study_plan": {{
    "Day 1": {{"focus": "subject", "topics": ["t1","t2"], "hours": 2, "tasks": ["task1"]}},
    "Day 2": {{...}},
    ...
  }},
  "personalized_notes": {{
    "subject": {{
      "beginner_notes": "...",
      "revision_summary": "...",
      "exam_tips": "..."
    }}
  }},
  "recommended_focus_areas": ["area1", "area2"],
  "improvement_strategy": "detailed paragraph on how the student should improve",
  "practice_questions": {{
    "subject": ["q1", "q2", "q3"]
  }}
}}
"""



def build_evaluate_prompt(topic: str, subject: str, student_answers: list, rag_context: str = "") -> str:
    qa_text = ""
    for i, qa in enumerate(student_answers):
        qa_text += f"\nQ{i+1}: {qa.get('question')}\nStudent Answer: {qa.get('answer')}\n"

    return f"""
You are TRI — an AI Evaluation Engine.
{_rag_block(rag_context)}
Evaluate the student's answers on the topic "{topic}" from subject "{subject}".

{qa_text}

Return ONLY a valid JSON object with this exact structure:
{{
  "total_questions": 0,
  "correct": 0,
  "score_percentage": 0,
  "question_results": [
    {{
      "question": "...",
      "student_answer": "...",
      "correct_answer": "...",
      "is_correct": true,
      "explanation": "..."
    }}
  ],
  "weak_areas": ["concept1", "concept2"],
  "strong_areas": ["concept1"],
  "performance_summary": "brief paragraph",
  "improvement_suggestions": ["tip1", "tip2"]
}}
"""



def build_quiz_prompt(topic: str, subject: str, difficulty: str = "medium", count: int = 5, rag_context: str = "") -> str:
    return f"""
You are TRI — an AI Quiz Generator.
{_rag_block(rag_context)}
Generate {count} short-answer quiz questions on topic "{topic}" from subject "{subject}".
Difficulty: {difficulty}

Return ONLY a valid JSON object:
{{
  "topic": "{topic}",
  "subject": "{subject}",
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "expected_answer": "...",
      "hint": "..."
    }}
  ]
}}
"""



def build_adapt_prompt(profile: dict, previous_plan: dict, weak_areas: list, improvement_suggestions: list) -> str:
    return f"""
You are TRI — an Adaptive Learning AI Agent.

A student just completed an evaluation. Based on their weak areas, regenerate and improve their study plan.

STUDENT PROFILE:
- Subjects: {', '.join(profile.get('subjects', []))}
- Daily Study Hours: {profile.get('study_hours')} hrs

DETECTED WEAK AREAS:
{json.dumps(weak_areas)}

IMPROVEMENT SUGGESTIONS FROM EVALUATION:
{json.dumps(improvement_suggestions)}

PREVIOUS STUDY PLAN SUMMARY:
{json.dumps(list(previous_plan.get('study_plan', {}).keys())[:3])} (first 3 days shown)

Return ONLY a valid JSON object with this exact structure:
{{
  "adapted_study_plan": {{
    "Day 1": {{"focus": "subject", "topics": ["t1"], "hours": 2, "tasks": ["task1"]}},
    ...
  }},
  "regenerated_notes": {{
    "weak_topic": {{
      "simplified_explanation": "...",
      "key_points": ["p1", "p2"],
      "practice_questions": ["q1", "q2"]
    }}
  }},
  "adaptation_reason": "explanation of what changed and why",
  "priority_topics": ["t1", "t2"]
}}
"""
