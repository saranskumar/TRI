const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function analyzeStudent(payload: {
    profile: Record<string, unknown>;
    marks: Record<string, unknown>;
    syllabus: string;
    pyqs: string;
    session_id?: string;
}) {
    const res = await fetch(`${API}/analyze_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function generatePlan(session_id: string, plan_days = 7) {
    const res = await fetch(`${API}/generate_plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, plan_days }),
    });
    return res.json();
}

export async function generateQuiz(session_id: string, topic: string, subject: string, difficulty = "medium", count = 5) {
    const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, action: "generate_quiz", topic, subject, difficulty, count }),
    });
    return res.json();
}

export async function submitAnswers(
    session_id: string,
    topic: string,
    subject: string,
    student_answers: { question: string; answer: string }[]
) {
    const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, action: "submit_answers", topic, subject, student_answers }),
    });
    return res.json();
}

export async function adaptLearning(session_id: string) {
    const res = await fetch(`${API}/adapt_learning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
    });
    return res.json();
}

export async function uploadResourceText(session_id: string, text: string) {
    const res = await fetch(`${API}/upload_resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, text }),
    });
    return res.json();
}

export async function uploadResourceFile(session_id: string, file: File) {
    const formData = new FormData();
    formData.append("session_id", session_id);
    formData.append("file", file);
    const res = await fetch(`${API}/upload_resource`, {
        method: "POST",
        body: formData,
    });
    return res.json();
}

export async function crawlTopic(session_id: string, subject: string, topics: string[]) {
    const res = await fetch(`${API}/crawl_topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, subject, topics }),
    });
    return res.json();
}

export async function getCLScheme(query: string) {
    const res = await fetch(`${API}/get_cl_context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });
    return res.json();
}
