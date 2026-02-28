"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateQuiz, submitAnswers } from "@/lib/api";

interface Question {
    id: number;
    question: string;
    expected_answer: string;
    hint?: string;
}

interface QuestionResult {
    question: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
}

interface EvalResult {
    total_questions: number;
    correct: number;
    score_percentage: number;
    question_results: QuestionResult[];
    weak_areas: string[];
    strong_areas: string[];
    performance_summary: string;
    improvement_suggestions: string[];
}

type Phase = "setup" | "quiz" | "results";

export default function EvaluatePage() {
    const router = useRouter();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>("setup");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Setup
    const [topic, setTopic] = useState("");
    const [subject, setSubject] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [count, setCount] = useState(5);

    // Quiz
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showHints, setShowHints] = useState<Record<number, boolean>>({});

    // Results
    const [result, setResult] = useState<EvalResult | null>(null);

    useEffect(() => {
        const s = localStorage.getItem("tri_session_id");
        if (!s) { router.push("/"); return; }
        setSessionId(s);
    }, [router]);

    async function handleGenerateQuiz() {
        if (!sessionId || !topic || !subject) return;
        setLoading(true);
        setError("");
        const res = await generateQuiz(sessionId, topic, subject, difficulty, count);
        if (res.error || !res.result?.questions) {
            setError(res.error || "Failed to generate quiz.");
        } else {
            setQuestions(res.result.questions);
            setAnswers({});
            setShowHints({});
            setPhase("quiz");
        }
        setLoading(false);
    }

    async function handleSubmitQuiz() {
        if (!sessionId) return;
        setLoading(true);
        setError("");
        const studentAnswers = questions.map(q => ({
            question: q.question,
            answer: answers[q.id] || "",
        }));
        const res = await submitAnswers(sessionId, topic, subject, studentAnswers);
        if (res.error || !res.result) {
            setError(res.error || "Failed to evaluate answers.");
        } else {
            setResult(res.result);
            setPhase("results");
        }
        setLoading(false);
    }

    const scoreColor = (pct: number) =>
        pct >= 75 ? "var(--accent-green)" : pct >= 50 ? "var(--accent-amber)" : "var(--accent-red)";

    return (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px" }}>
            {/* Header */}
            <div className="fade-in" style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                    🧪 <span className="gradient-text">Evaluate Me</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    TRI generates a personalized quiz, assesses your answers, and detects conceptual weaknesses.
                </p>
            </div>

            {/* SETUP PHASE */}
            {phase === "setup" && (
                <div className="card-glow fade-in" style={{ padding: 28 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Configure Your Quiz</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Subject</label>
                            <input className="input-field" placeholder="e.g. DBMS" value={subject} onChange={e => setSubject(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Topic</label>
                            <input className="input-field" placeholder="e.g. Normalization" value={topic} onChange={e => setTopic(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                        <div>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Difficulty</label>
                            <div style={{ display: "flex", gap: 6 }}>
                                {["easy", "medium", "hard"].map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)}
                                        style={{
                                            flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid",
                                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            borderColor: difficulty === d ? "var(--accent-purple)" : "var(--border)",
                                            background: difficulty === d ? "rgba(139,92,246,0.15)" : "transparent",
                                            color: difficulty === d ? "var(--accent-purple)" : "var(--text-secondary)",
                                            textTransform: "capitalize",
                                        }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Number of Questions</label>
                            <div style={{ display: "flex", gap: 6 }}>
                                {[3, 5, 10].map(n => (
                                    <button key={n} onClick={() => setCount(n)}
                                        style={{
                                            flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                                            borderColor: count === n ? "var(--accent-cyan)" : "var(--border)",
                                            background: count === n ? "rgba(6,182,212,0.12)" : "transparent",
                                            color: count === n ? "var(--accent-cyan)" : "var(--text-secondary)",
                                        }}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
                            ⚠ {error}
                        </div>
                    )}

                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 15 }}
                        onClick={handleGenerateQuiz} disabled={loading || !topic || !subject}>
                        {loading ? <span className="pulse">Generating Quiz…</span> : "⚡ Generate Quiz"}
                    </button>
                </div>
            )}

            {/* QUIZ PHASE */}
            {phase === "quiz" && (
                <div className="fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{subject} — </span>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{topic}</span>
                        </div>
                        <span className="badge" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>{difficulty}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                        {questions.map((q, idx) => (
                            <div key={q.id} className="card-glow" style={{ padding: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5, flex: 1 }}>
                                        <span style={{ color: "var(--accent-purple)", marginRight: 8 }}>Q{idx + 1}.</span>
                                        {q.question}
                                    </p>
                                    {q.hint && (
                                        <button onClick={() => setShowHints(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                            style={{ background: "none", border: "none", color: "var(--accent-amber)", cursor: "pointer", fontSize: 12, marginLeft: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                                            {showHints[q.id] ? "▲ Hide hint" : "💡 Hint"}
                                        </button>
                                    )}
                                </div>
                                {showHints[q.id] && q.hint && (
                                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: 10 }}>
                                        <p style={{ fontSize: 12, color: "#fbbf24" }}>{q.hint}</p>
                                    </div>
                                )}
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    placeholder="Type your answer here…"
                                    value={answers[q.id] || ""}
                                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-secondary" onClick={() => setPhase("setup")} style={{ flex: 1, justifyContent: "center" }} disabled={loading}>
                            ← Restart
                        </button>
                        <button className="btn-primary" onClick={handleSubmitQuiz} disabled={loading} style={{ flex: 2, justifyContent: "center", fontSize: 15 }}>
                            {loading ? <span className="pulse">Evaluating…</span> : "🎯 Submit & Evaluate"}
                        </button>
                    </div>
                </div>
            )}

            {/* RESULTS PHASE */}
            {phase === "results" && result && (
                <div className="fade-in">
                    {/* Score card */}
                    <div style={{
                        marginBottom: 24, padding: 28, borderRadius: 16,
                        background: `linear-gradient(135deg, ${scoreColor(result.score_percentage)}22, transparent)`,
                        border: `1px solid ${scoreColor(result.score_percentage)}44`,
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor(result.score_percentage), lineHeight: 1 }}>
                            {result.score_percentage}%
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
                            {result.correct} / {result.total_questions} correct
                        </p>
                        <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "12px auto 0", maxWidth: 480, lineHeight: 1.6 }}>
                            {result.performance_summary}
                        </p>
                    </div>

                    {/* Weak / Strong areas */}
                    {(result.weak_areas.length > 0 || result.strong_areas.length > 0) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                            <div className="card-glow" style={{ padding: 18 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-red)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Weak Areas</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {result.weak_areas.map(w => (
                                        <span key={w} className="badge" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{w}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="card-glow" style={{ padding: 18 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-green)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>✓ Strong Areas</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {result.strong_areas.map(s => (
                                        <span key={s} className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Improvement suggestions */}
                    {result.improvement_suggestions.length > 0 && (
                        <div className="card-glow" style={{ padding: 20, marginBottom: 20 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-cyan)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>📈 Improvement Suggestions</p>
                            <ul style={{ paddingLeft: 16 }}>
                                {result.improvement_suggestions.map((s, i) => (
                                    <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, lineHeight: 1.5 }}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Question breakdown */}
                    <div className="card-glow" style={{ padding: 20, marginBottom: 24 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Question Breakdown</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {result.question_results.map((qr, i) => (
                                <div key={i} style={{
                                    borderRadius: 10, padding: 14,
                                    background: qr.is_correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                                    border: `1px solid ${qr.is_correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Q{i + 1}. {qr.question}</p>
                                        <span style={{ fontSize: 18, marginLeft: 12 }}>{qr.is_correct ? "✅" : "❌"}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                                        Your answer: <em>{qr.student_answer || "—"}</em>
                                    </p>
                                    {!qr.is_correct && (
                                        <p style={{ fontSize: 12, color: "#34d399", marginTop: 4 }}>
                                            Correct: <em>{qr.correct_answer}</em>
                                        </p>
                                    )}
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
                                        {qr.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-secondary" onClick={() => setPhase("setup")} style={{ flex: 1, justifyContent: "center" }}>Try Again</button>
                        <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ flex: 2, justifyContent: "center" }}>
                            🔄 Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
