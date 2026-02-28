"use client";
import { useEffect, useState } from "react";
import { BarChart, TrendingUp, Clock, Target, CheckCircle2, Zap } from "lucide-react";

export default function AnalyticsPage() {
    const [readiness] = useState(65); // Mocked for visual build

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                    Performance Analytics
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Deep dive into your academic metrics and progress.</p>
            </div>

            {/* Top Value Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>

                <div className="card-glow" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <TrendingUp size={16} color="var(--accent-primary)" /> Overall Readiness
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>{readiness}%</span>
                        <span style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: 600, paddingBottom: "4px" }}>+12%</span>
                    </div>
                </div>

                <div className="card-glow" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <Target size={16} color="var(--accent-primary)" /> Quiz Accuracy
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>78%</span>
                        <span style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: 600, paddingBottom: "4px" }}>+5%</span>
                    </div>
                </div>

                <div className="card-glow" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <Clock size={16} color="var(--accent-primary)" /> Total Study Time
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>42h</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, paddingBottom: "4px" }}>This Month</span>
                    </div>
                </div>

                <div className="card-glow" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>
                        <Zap size={16} color="var(--accent-primary)" /> Weaknesses Resolved
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                        <span style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-1px" }}>14</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, paddingBottom: "4px" }}>Topics</span>
                    </div>
                </div>

            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>

                {/* Readiness Trend Chart (Mock Vis) */}
                <div className="card-glow" style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <BarChart size={20} color="var(--text-secondary)" /> 30-Day Readiness Trend
                    </h2>

                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "16px", height: "200px", paddingBottom: "24px", borderBottom: "1px dashed var(--border)" }}>
                        {/* Mock bars for a trend chart */}
                        {[40, 45, 42, 50, 55, 52, 60, 58, 65, 68, 72, 75].map((val, i) => (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "100%", height: `${val}%`, minHeight: "10%",
                                    background: val > 60 ? "var(--accent-green)" : "var(--accent-primary)",
                                    borderRadius: "4px 4px 0 0",
                                    opacity: i === 11 ? 1 : 0.6
                                }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, marginTop: "12px" }}>
                        <span>4 Weeks Ago</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Cognitive Gaps / Topic Mastery */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    <div className="card-glow" style={{ padding: "24px", background: "rgba(14,159,110,0.05)", border: "1px solid var(--accent-green)" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-green)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle2 size={18} /> Recently Mastered
                        </h3>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "12px", padding: 0, margin: 0, listStyle: "none" }}>
                            <li style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>ER Diagrams</li>
                            <li style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>Relational Data Models</li>
                            <li style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>OS Processes</li>
                        </ul>
                    </div>

                    <div className="card-glow" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Accuracy by Subject</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                <span style={{ color: "var(--text-secondary)" }}>Database Management</span>
                                <span style={{ color: "var(--text-primary)" }}>82%</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                <span style={{ color: "var(--text-secondary)" }}>Operating Systems</span>
                                <span style={{ color: "var(--text-primary)" }}>54%</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                                <span style={{ color: "var(--text-secondary)" }}>Computer Networks</span>
                                <span style={{ color: "var(--text-primary)" }}>91%</span>
                            </div>

                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
