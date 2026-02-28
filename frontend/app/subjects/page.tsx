"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, BarChart2 } from "lucide-react";

export default function SubjectsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem("tri_profile");
        if (saved) setProfile(JSON.parse(saved));
    }, []);

    const subjects = profile?.subjects || ["Database Management", "Operating Systems", "Computer Networks"];

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "32px" }}>
                Your Subjects
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {subjects.map((sub: string, i: number) => {
                    const progress = [75, 40, 90][i % 3]; // mock progress
                    const priority = ["Medium", "High", "Low"][i % 3];
                    return (
                        <div
                            key={sub}
                            className="card-glow"
                            style={{ padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column" }}
                            onClick={() => router.push(`/subject/${encodeURIComponent(sub)}`)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "12px", color: "var(--accent-primary)" }}>
                                    <BookOpen size={24} />
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", padding: "4px 10px", borderRadius: "99px", background: priority === "High" ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)", color: priority === "High" ? "var(--accent-red)" : "var(--text-secondary)" }}>
                                    {priority} Priority
                                </span>
                            </div>

                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>{sub}</h2>

                            <div style={{ marginTop: "auto" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}><BarChart2 size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 4 }} /> Mastery</span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{progress}%</span>
                                </div>
                                <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--accent-primary)", width: `${progress}%`, borderRadius: "99px" }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
