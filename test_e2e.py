import requests
import json
import time
import sys

API = "http://localhost:5000"

def print_step(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def run_tests():
    # 1. Analyze Student
    print_step("1. Analyzing Student Context")
    payload = {
        "profile": {
            "year": "3rd Year",
            "branch": "Computer Science",
            "cgpa": "7.5",
            "constraints": "Can study 2 hours daily",
            "goals": "Score above 80% in semesters"
        },
        "marks": {
            "Database Management": 45,
            "Operating Systems": 78,
            "Computer Networks": 60
        },
        "syllabus": "Unit 1: Relational Algebra, ER Models. Unit 2: SQL, Normalization.",
        "pyqs": "Q1: Explain 3NF. Q2: What is an ER diagram?"
    }
    
    try:
        res = requests.post(f"{API}/analyze_student", json=payload)
        res.raise_for_status()
        data = res.json()
        session_id = data.get("session_id")
        print(f"SUCCESS: Received session_id: {session_id}")
        print("Analysis:", json.dumps(data.get("analysis", {}), indent=2))
    except Exception as e:
        print(f"FAILED steps 1: {e}")
        if 'res' in locals(): print(res.text)
        sys.exit(1)

    # 2. Generate Plan
    print_step("2. Generating Study Plan")
    try:
        res = requests.post(f"{API}/generate_plan", json={"session_id": session_id, "plan_days": 3})
        res.raise_for_status()
        plan_data = res.json()
        print("SUCCESS: Plan Generated")
        # print("Plan Snippet:", json.dumps(plan_data.get("plan", {})['study_plan']['Day 1'], indent=2))
        print(f"Days Scheduled: {len(plan_data.get('plan', {}).get('study_plan', {}))}")
    except Exception as e:
        print(f"FAILED step 2: {e}")
        if 'res' in locals(): print(res.text)

    # 3. Generate Quiz
    print_step("3. Generating Quiz for Database Management")
    try:
        quiz_payload = {
            "session_id": session_id,
            "action": "generate_quiz",
            "topic": "Normalization",
            "subject": "Database Management",
            "difficulty": "medium",
            "count": 2
        }
        res = requests.post(f"{API}/evaluate", json=quiz_payload)
        res.raise_for_status()
        quiz_data = res.json()
        print("SUCCESS: Quiz Generated")
        print(f"Questions received: {len(quiz_data.get('quiz', []))}")
    except Exception as e:
        print(f"FAILED step 3: {e}")
        if 'res' in locals(): print(res.text)

    # 4. Submit Answers
    print_step("4. Submitting Answers for Evaluation")
    try:
        questions = quiz_data.get('quiz', [])
        answers = []
        for i, q in enumerate(questions):
            answers.append({
                "question": q.get('question', ''),
                "answer": "Normalization is the process of organizing data to reduce redundancy." if i == 0 else "Random guess."
            })
            
        eval_payload = {
            "session_id": session_id,
            "action": "submit_answers",
            "topic": "Normalization",
            "subject": "Database Management",
            "student_answers": answers
        }
        res = requests.post(f"{API}/evaluate", json=eval_payload)
        res.raise_for_status()
        eval_data = res.json()
        print("SUCCESS: Evaluation Complete")
        print("Score:", eval_data.get("score"))
        print("Feedback snippet:", eval_data.get("feedback", [])[0].get("feedback"))
    except Exception as e:
        print(f"FAILED step 4: {e}")
        if 'res' in locals(): print(res.text)


if __name__ == "__main__":
    run_tests()
