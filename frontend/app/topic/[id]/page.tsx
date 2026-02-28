"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, PlayCircle, FileText, CheckCircle2, Circle, MessageSquare, Zap, BookMarked, Settings, RefreshCw } from "lucide-react";

export default function TopicWorkspacePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const topicName = decodeURIComponent(params.id as string);
    const subjectName = searchParams.get("subject") ? decodeURIComponent(searchParams.get("subject")!) : "Subject";

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);

    // Mock loading sequence
    useEffect(() => {
        setTimeout(() => {
            setContent({
                summary: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller ones and defining relationships between them.",
                notes: `1. First Normal Form (1NF):\n- Eliminate repeating groups in individual tables.\n- Create a separate table for each set of related data.\n- Identify each set of related data with a primary key.\n\n2. Second Normal Form (2NF):\n- Meet all requirements of 1NF.\n- Remove subsets of data that apply to multiple rows of a table and place them in separate tables.\n- Create relationships between these new tables and their predecessors through the use of foreign keys.\n\n3. Third Normal Form (3NF):\n- Meet all requirements of 2NF.\n- Remove columns that are not dependent upon the primary key.`,
                pyqs: [
                    "Explain 1NF, 2NF and 3NF with suitable examples. (10 marks, 2022)",
                    "What are the anomalies that arise if a database is not normalized? (5 marks, 2021)"
                ]
            });
            setLoading(false);
        }, 1200);
    }, []);

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: "32px" }}>

            {/* Main Workspace Column */}
            <div style={{ display: "flex", flexDirection: "column" }}>

                <button
                    onClick={() => router.back()}
                    style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "24px" }}
                >
                    <ChevronLeft size={16} /> Back to {subjectName}
                </button>

                <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-1px", marginBottom: "32px" }}>
                    {topicName}
                </h1>

                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                        <RefreshCw size={24} className="pulse" color="var(--accent-primary)" style={{ marginBottom: "16px" }} />
                        <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14px" }}>TRI is retrieving context from your syllabus...</p>
                    </div>
                ) : (
                    <>
                        {/* AI Summary Block */}
                        <div style={{ padding: "24px", background: "rgba(255, 109, 31, 0.05)", borderLeft: "4px solid var(--accent-primary)", borderRadius: "0 12px 12px 0", marginBottom: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent-hover)" }}>
                                <Zap size={18} />
                                <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>TRI AI Summary</span>
                            </div>
                            <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.6 }}>{content.summary}</p>
                        </div>

                        {/* Notes Viewer */}
                        <div className="card-glow" style={{ padding: "32px", marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <FileText size={20} color="var(--accent-primary)" /> Concept Notes
                            </h2>
                            <div style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                {content.notes}
                            </div>
                        </div>

                        {/* PYQs */}
                        <div className="card-glow" style={{ padding: "32px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <BookMarked size={20} color="var(--accent-primary)" /> Previous Year Questions
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {content.pyqs.map((q: string, i: number) => (
                                    <div key={i} style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px", fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Action / Context Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                <div className="card-glow" style={{ padding: "24px", position: "sticky", top: "88px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "20px" }}>
                        Actions
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/practice")}>
                            <PlayCircle size={16} /> Generate Practice
                        </button>
                        <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                            <MessageSquare size={16} /> Explain Simply
                        </button>
                        <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                            <FileText size={16} /> Summarize Topic
                        </button>
                    </div>

                    <div style={{ width: "100%", height: "1px", background: "var(--border)", margin: "24px 0" }} />

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Status</span>
                        <button style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Circle size={12} color="var(--text-secondary)" /> Not Started
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
