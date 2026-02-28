"use client";
import { useEffect, useState } from "react";
import { BookOpen, Clock, FileText, BarChart2, PlusCircle, CheckCircle } from "lucide-react";

export default function LeftSidebar() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        // Load from local storage for MVP contextual display
        const saved = localStorage.getItem("tri_profile");
        if (saved) {
            try {
                setProfile(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);

    return (
        <aside
            style={{
                width: "280px",
                background: "var(--bg-card)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "24px",
            }}
        >
            <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                    Student Context
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                            <BookOpen size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>Semester</div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{profile?.semester || "Not set"}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                            <Clock size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>Study Commitment</div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{profile?.study_hours ? `${profile.study_hours} hrs/day` : "Not set"}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                    Active Subjects
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {profile?.subjects ? (
                        profile.subjects.map((sub: string) => (
                            <div key={sub} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{sub}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                                    {profile.confidence?.[sub] || "medium"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>No subjects added.</div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: "auto" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                    Resources
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px", background: "var(--bg-primary)", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} className="hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]">
                        <FileText size={16} /> Upload Syllabus
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px", background: "var(--bg-primary)", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} className="hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]">
                        <BarChart2 size={16} /> Upload Marks
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px", background: "var(--bg-primary)", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} className="hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]">
                        <PlusCircle size={16} /> Add Notes / PYQs
                    </button>
                </div>

                <button className="btn-primary" style={{ width: "100%", marginTop: "24px", justifyContent: "center" }}>
                    Analyze My Academics
                </button>
            </div>
        </aside>
    );
}
