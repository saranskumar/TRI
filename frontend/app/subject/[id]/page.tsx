"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, PlayCircle, FileText, CheckCircle2, Circle } from "lucide-react";

export default function SubjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const subjectName = decodeURIComponent(params.id as string);

    // Mocking units and topics for the UI redesign. 
    // In reality, this would be fetched from the backend's RAG metadata extraction.
    const units = [
        {
            id: "u1",
            name: "Unit 1: Introduction",
            progress: 100,
            priority: "Low",
            topics: [
                { name: "Database System Concepts", completed: true },
                { name: "Relational Data Models", completed: true },
                { name: "Schema Architecture", completed: true },
            ]
        },
        {
            id: "u2",
            name: "Unit 2: Database Design",
            progress: 40,
            priority: "High",
            topics: [
                { name: "ER Diagrams", completed: true },
                { name: "Normalization (1NF, 2NF, 3NF)", completed: false },
                { name: "Functional Dependencies", completed: false },
            ]
        },
        {
            id: "u3",
            name: "Unit 3: SQL & Transactions",
            progress: 0,
            priority: "Medium",
            topics: [
                { name: "Basic SQL Queries", completed: false },
                { name: "Joins and Subqueries", completed: false },
                { name: "ACID Properties", completed: false },
            ]
        }
    ];

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
            <button
                onClick={() => router.back()}
                style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "24px" }}
            >
                <ChevronLeft size={16} /> Back to Subjects
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                <div>
                    <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-1px" }}>
                        {subjectName}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "8px" }}>
                        Overall Progress: <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>46%</span> • Last Studied: Today
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button className="btn-secondary"><FileText size={16} /> View Notes</button>
                    <button className="btn-primary"><PlayCircle size={16} /> Resume Study</button>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {units.map((unit) => (
                    <div key={unit.id} className="card-glow" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span className="badge" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontSize: "11px" }}>{unit.progress}%</span>
                                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{unit.name}</h2>
                            </div>
                            <span className="badge" style={{ background: unit.priority === "High" ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)", color: unit.priority === "High" ? "var(--accent-red)" : "var(--text-secondary)" }}>
                                {unit.priority} Priority
                            </span>
                        </div>

                        <div style={{ height: "4px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ height: "100%", background: unit.progress === 100 ? "var(--accent-green)" : "var(--accent-primary)", width: `${unit.progress}%`, borderRadius: "99px" }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                            {unit.topics.map((topic, index) => (
                                <div
                                    key={index}
                                    onClick={() => router.push(`/topic/${encodeURIComponent(topic.name)}?subject=${encodeURIComponent(subjectName)}`)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", background: "var(--bg-primary)", cursor: "pointer", transition: "all 0.2s" }}
                                    className="hover:border-[var(--accent-primary)] border border-[transparent]"
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        {topic.completed ? <CheckCircle2 size={18} color="var(--accent-green)" /> : <Circle size={18} color="var(--text-secondary)" />}
                                        <span style={{ fontSize: "14px", fontWeight: topic.completed ? 500 : 600, color: topic.completed ? "var(--text-secondary)" : "var(--text-primary)" }}>
                                            {topic.name}
                                        </span>
                                    </div>
                                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-primary)", display: "flex", alignItems: "center", fontSize: "12px", fontWeight: 600 }}>
                                        Study <ChevronRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
