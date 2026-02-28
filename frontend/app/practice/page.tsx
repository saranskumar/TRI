"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Target, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { generateQuiz, submitAnswers } from "@/lib/api";

export default function PracticePage() {
    const router = useRouter();
    const [session, setSession] = useState<string | null>(null);
    const [topic, setTopic] = useState("");
    const [subject, setSubject] = useState("");
    const [generating, setGenerating] = useState(false);
    const [quiz, setQuiz] = useState<any[] | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const s = localStorage.getItem("tri_session_id");
        if (!s) { router.push("/"); return; }
        setSession(s);
    }, [router]);

    async function handleGenerate() {
        if (!session || !topic || !subject) return;
        setGenerating(true);
        const res = await generateQuiz(session, topic, subject);
        if (!res.error && res.result?.quiz) {
            setQuiz(res.result.quiz);
            setResult(null);
        }
        setGenerating(false);
    }

    async function handleSubmit() {
        if (!session || !quiz) return;
        setEvaluating(true);
        const submission = quiz.map((q, i) => ({
            question: q.question,
            answer: answers[i] || ""
        }));
        const res = await submitAnswers(session, topic, subject, submission);
        if (!res.error && res.result) {
            setResult(res.result);
        }
        setEvaluating(false);
    }

    const isComplete = quiz && Object.keys(answers).length === quiz.length;

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Target size={24} color="var(--accent-primary)" /> Practice Lab
            </h1>

            {!quiz && !result && (
                <div className="card-glow" style={{ padding: "32px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>Configure Session</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Subject</label>
                            <input
                                value={subject} onChange={e => setSubject(e.target.value)}
                                className="input-field" placeholder="e.g. Database Management"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Topic Focus</label>
                            <input
                                value={topic} onChange={e => setTopic(e.target.value)}
                                className="input-field" placeholder="e.g. Normalization"
                            />
                        </div>
                    </div>
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }} onClick={handleGenerate} disabled={generating || !subject || !topic}>
                        {generating ? (
                            <span className="pulse">Preparing Practice...</span>
                        ) : (
                            <><PlayCircle size={18} /> Start Practice</>
                        )}
                    </button>
                </div>
            )}

            {quiz && !result && (
                <div className="fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>Topic: {topic}</span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-secondary)", padding: "6px 16px", borderRadius: "99px" }}>
                            {Object.keys(answers).length} / {quiz.length} Answered
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {quiz.map((q, i) => (
                            <div key={i} className="card-glow" style={{ padding: "32px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "24px", display: "flex", gap: "12px" }}>
                                    <span style={{ color: "var(--accent-primary)", flexShrink: 0 }}>Q{i + 1}.</span> {q.question}
                                </h3>

                                {q.type === "mcq" ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {q.options?.map((opt: string) => (
                                            <button
                                                key={opt}
                                                onClick={() => setAnswers({ ...answers, [i]: opt })}
                                                style={{
                                                    padding: "16px", textAlign: "left", borderRadius: "10px",
                                                    border: answers[i] === opt ? "2px solid var(--accent-primary)" : "1px solid var(--border)",
                                                    background: answers[i] === opt ? "rgba(255,109,31,0.05)" : "var(--bg-card)",
                                                    color: "var(--text-primary)", fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        className="input-field"
                                        placeholder="Type your answer here..."
                                        style={{ minHeight: "120px" }}
                                        value={answers[i] || ""}
                                        onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", padding: "16px", marginTop: "32px", fontSize: "16px" }}
                        onClick={handleSubmit}
                        disabled={evaluating || !isComplete}
                    >
                        {evaluating ? <span className="pulse">Evaluating Answers...</span> : "Submit Answers"}
                    </button>
                </div>
            )}

            {result && (
                <div className="fade-in">
                    <div className="card-glow" style={{ padding: "40px", textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ background: "rgba(14,159,110,0.1)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--accent-green)" }}>{result.score}/10</span>
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Practice Complete</h2>
                        <p style={{ color: "var(--text-secondary)" }}>TRI has evaluated your performance and detected weaknesses.</p>
                    </div>

                    {result.weak_areas?.length > 0 && (
                        <div className="card-glow" style={{ padding: "32px", marginBottom: "32px", border: "1px solid var(--accent-primary)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                <AlertTriangle size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Weak Topics Detected</h3>
                            </div>
                            <ul style={{ display: "flex", flexDirection: "column", gap: "12px", padding: 0, margin: 0, listStyle: "none" }}>
                                {result.weak_areas.map((w: string, i: number) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: 500 }}>
                                        <AlertCircle size={14} color="var(--text-secondary)" /> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "16px" }}>
                        <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ flex: 1, justifyContent: "center" }}>
                            Update Dashboard
                        </button>
                        <button className="btn-secondary" onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }} style={{ flex: 1, justifyContent: "center" }}>
                            Practice Again
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
