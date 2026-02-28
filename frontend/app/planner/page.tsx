"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw } from "lucide-react";

export default function PlannerPage() {
    const [plan, setPlan] = useState<any>(null);

    useEffect(() => {
        const p = localStorage.getItem("tri_plan");
        if (p) {
            setPlan(JSON.parse(p));
        }
    }, []);

    if (!plan) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "16px" }}>
                <Calendar size={32} color="var(--text-secondary)" />
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>No study plan available. Run Analysis first.</p>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                        Study Planner
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Your personalized academic roadmap.</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(14,159,110,0.1)", border: "1px solid rgba(14,159,110,0.2)", padding: "8px 16px", borderRadius: "99px" }}>
                    <RefreshCw size={14} color="var(--accent-green)" />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-green)" }}>Auto-adjusted 2 hours ago based on Quiz results</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px" }}>
                {/* Left Column: Calendar / Daily Allocation */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {plan.study_plan && Object.entries(plan.study_plan).map(([day, p]: [string, any], index: number) => (
                        <div key={day} className="card-glow" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <div style={{ background: index === 0 ? "var(--accent-primary)" : "var(--bg-secondary)", padding: "16px 24px", color: index === 0 ? "white" : "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Calendar size={18} />
                                    <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{day} {index === 0 && "(Today)"}</h2>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, background: index === 0 ? "rgba(255,255,255,0.2)" : "var(--bg-card)", padding: "4px 12px", borderRadius: "99px" }}>
                                    <Clock size={14} /> {p.hours} hours
                                </div>
                            </div>

                            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Focus Area</h3>
                                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent-primary)" }}>{p.focus}</div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                    <div>
                                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Topics to Cover</h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {p.topics?.map((t: string) => (
                                                <div key={t} style={{ fontSize: "13px", background: "var(--bg-secondary)", padding: "6px 12px", borderRadius: "6px", color: "var(--text-primary)", fontWeight: 500, border: "1px solid var(--border)" }}>
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Task Checklist</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {p.tasks?.map((task: string, i: number) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                                    {index === 0 && i === 0 ? <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: "2px" }} /> : <Circle size={18} color="var(--border)" style={{ flexShrink: 0, marginTop: "2px" }} />}
                                                    <span style={{ fontSize: "14px", color: index === 0 && i === 0 ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: index === 0 && i === 0 ? "line-through" : "none", lineHeight: 1.5 }}>{task}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* Right Column: Weekly Distribution & Context */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    <div className="card-glow" style={{ padding: "24px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Weekly Distribution</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                    <span style={{ color: "var(--text-secondary)" }}>Database Management</span>
                                    <span style={{ color: "var(--text-primary)" }}>12 hrs</span>
                                </div>
                                <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--accent-primary)", width: "65%", borderRadius: "99px" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                    <span style={{ color: "var(--text-secondary)" }}>Operating Systems</span>
                                    <span style={{ color: "var(--text-primary)" }}>8 hrs</span>
                                </div>
                                <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--accent-primary)", width: "45%", borderRadius: "99px" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                    <span style={{ color: "var(--text-secondary)" }}>Computer Networks</span>
                                    <span style={{ color: "var(--text-primary)" }}>5 hrs</span>
                                </div>
                                <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--accent-primary)", width: "30%", borderRadius: "99px" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-glow" style={{ padding: "24px", background: "rgba(255,109,31,0.05)", border: "1px solid var(--accent-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent-primary)" }}>
                            <AlertCircle size={18} />
                            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Strategy Insight</h2>
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                            {plan.improvement_strategy || "Focus heavily on DBMS concepts this week, specifically normalization and transaction properties to prepare for the upcoming internal."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
