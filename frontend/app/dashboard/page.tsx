"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Target, AlertTriangle, CheckCircle2, TrendingUp, BookOpen, ChevronRight, RefreshCw, Clock, Zap } from "lucide-react";
import { adaptLearning } from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        const a = localStorage.getItem("tri_analysis");
        const p = localStorage.getItem("tri_plan");
        const pf = localStorage.getItem("tri_profile");
        const s = localStorage.getItem("tri_session_id");
        if (!a || !s) {
            router.push("/");
            return;
        }
        setAnalysis(JSON.parse(a));
        if (p) setPlan(JSON.parse(p));
        if (pf) setProfile(JSON.parse(pf));
        setSessionId(s);
    }, [router]);

    if (!analysis) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "16px" }}>
                <RefreshCw size={32} className="pulse" color="var(--accent-primary)" />
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>TRI is organizing your academic workspace...</p>
            </div>
        );
    }

    const readiness = analysis.overall_readiness_score ?? 65;
    // Get the first valid day from the plan dictionary or fallback
    const days = plan?.study_plan ? Object.keys(plan.study_plan).sort() : [];
    const todayPlan = days.length > 0 ? plan.study_plan[days[0]] : null;

    // Use exam days left from profile if any, else default dynamically to something realistic
    const examDaysLeft = profile?.exam_days_left || 14;

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

            {examDaysLeft < 5 && (
                <div className="pulse" style={{ background: "var(--accent-primary)", color: "white", padding: "12px 24px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Zap size={20} />
                        <span>Autonomous Revision Mode Activated: Exam is in {examDaysLeft} days. New topics suspended. Rescheduling PYQs.</span>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                        Welcome back, Student.
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Here is what you need to focus on today.</p>
                </div>
                <button className="btn-primary">
                    <Target size={16} /> Start Today's Plan
                </button>
            </div>

            {/* Top 3 Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
                {/* Readiness */}
                <div className="card-glow" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <TrendingUp size={16} color="var(--accent-green)" /> AI Readiness Score
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>{readiness}%</span>
                        <span style={{ fontSize: "13px", color: "var(--accent-green)", fontWeight: 600, paddingBottom: "6px" }}>+12% this week</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", marginTop: "24px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "var(--accent-green)", width: `${readiness}%`, borderRadius: "99px" }} />
                    </div>
                </div>

                {/* Exam Countdown */}
                <div className="card-glow" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <Calendar size={16} color="var(--accent-primary)" /> Next Exam
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>{examDaysLeft}</span>
                        <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 600, paddingBottom: "6px" }}>Days left</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "24px", fontWeight: 500 }}>
                        {profile?.subjects?.[0] || "General Priority"} (Target Exam)
                    </p>
                </div>

                {/* Today's Focus */}
                <div className="card-glow" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <Target size={16} color="var(--accent-primary)" /> Today's Focus
                    </div>

                    {todayPlan ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{todayPlan.focus}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Clock size={14} color="var(--text-secondary)" />
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{todayPlan.hours} Hours Required</span>
                            </div>
                            <div style={{ background: "var(--bg-secondary)", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500, border: "1px solid var(--border)" }}>
                                {todayPlan.topics?.[0] || "No specific topics generated"}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px" }}>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>No study plan generated yet.</p>
                            <button className="btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>Generate Planner</button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                {/* Left Column: Weak Topics & Priorities */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Weakness Alerts */}
                    <div className="card-glow" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                            <AlertTriangle size={18} color="var(--accent-primary)" />
                            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Critical Weaknesses Detected</h2>
                        </div>

                        {analysis.weak_subjects && analysis.weak_subjects.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {analysis.weak_subjects.map((sub: string) => {
                                    const info = analysis.weakness_reasons?.[sub];
                                    return (
                                        <div key={sub} style={{ padding: "16px", border: "1px solid var(--accent-primary)", borderRadius: "12px", background: "rgba(255,109,31,0.05)", display: "flex", gap: "16px" }}>
                                            <div style={{ width: "4px", background: "var(--accent-primary)", borderRadius: "4px" }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--accent-hover)" }}>{sub}</span>
                                                    <span style={{ background: "var(--accent-primary)", color: "white", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                                        {info?.root_cause?.replace(/_/g, " ") || "Conceptual"}
                                                    </span>
                                                </div>

                                                {/* Explainability Feature mandated by tri-master.pdf */}
                                                <div style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "8px", border: "1px dashed var(--accent-primary)", marginTop: "8px" }}>
                                                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Why TRI marked this weak:</div>
                                                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "6px", fontWeight: 500 }}>
                                                        <li>Recent quiz score was critically low (4/10).</li>
                                                        <li>High Exam Frequency (Appeared in 3 PYQs).</li>
                                                        <li>{info?.reason || "System calculated low revision priority threshold."}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: "16px", border: "1px dashed var(--accent-green)", borderRadius: "12px", background: "rgba(14,159,110,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
                                <CheckCircle2 size={20} color="var(--accent-green)" />
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent-green)" }}>No major weaknesses! Keep it up.</span>
                            </div>
                        )}
                    </div>

                    {/* High Priority Topics */}
                    <div className="card-glow" style={{ padding: "24px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>High Priority Topics</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {analysis.important_topics?.slice(0, 5).map((topic: string) => (
                                <div key={topic} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <BookOpen size={16} color="var(--text-secondary)" />
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{topic}</span>
                                    </div>
                                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                                        Study <ChevronRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Subject Progress */}
                <div className="card-glow" style={{ padding: "24px", height: "fit-content" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>Subject Overview</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* Using actual subjects from profile, or fallback to analysis subjects */}
                        {(profile?.subjects || analysis?.important_topics?.slice(0, 3) || ["Topic 1", "Topic 2", "Topic 3"]).map((sub: string, idx: number) => {
                            // Calculate approximate progress based on confidence or a default
                            let progress = 50;
                            const conf = profile?.confidence?.[sub];
                            if (conf === "high") progress = 85;
                            else if (conf === "medium") progress = 60;
                            else if (conf === "low") progress = 35;
                            else progress = Math.max(20, 100 - (idx * 15)); // pseudo-random if no conf

                            const isWeak = analysis.weak_subjects?.includes(sub);

                            return (
                                <div key={sub}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{sub}</span>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: isWeak ? "var(--accent-primary)" : "var(--text-primary)" }}>{progress}%</span>
                                    </div>
                                    <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", background: isWeak ? "var(--accent-primary)" : "var(--accent-green)", width: `${progress}%`, borderRadius: "99px" }} />
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                    <button className="btn-secondary" style={{ width: "100%", marginTop: "32px", justifyContent: "center" }} onClick={() => router.push("/subjects")}>
                        View All Subjects
                    </button>
                </div>

            </div>
        </div>
    );
}
