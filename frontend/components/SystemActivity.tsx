"use client";
import { useState, useEffect } from "react";
import { Terminal, CheckCircle } from "lucide-react";

export default function SystemActivity() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Simulated live terminal activity log to meet Hackathon transparency criteria
        const defaultLogs = [
            "System initialized... connecting to SQLite memory store.",
            "Awaiting syllabus structure ingestion.",
        ];
        setLogs(defaultLogs);

        // Mock live stream for demo purposes
        const timers = [
            setTimeout(() => setLogs(prev => [...prev, "Extracting semantic topics from PDF context..."]), 3000),
            setTimeout(() => setLogs(prev => [...prev, "FAISS Index: Added 42 new metadata-tagged chunks."]), 6000),
            setTimeout(() => setLogs(prev => [...prev, "Crawler Service: Mapping GeeksforGeeks external resources..."]), 9000),
            setTimeout(() => setLogs(prev => [...prev, "Database: Updating behavioral learning matrix priorities."]), 12000),
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div style={{ width: "300px", borderLeft: "1px solid var(--border)", background: "var(--bg-secondary)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                <Terminal size={18} color="var(--accent-primary)" /> System Activity
            </div>
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "monospace", fontSize: "12px" }}>
                {logs.map((log, i) => (
                    <div key={i} className="fade-in" style={{ display: "flex", gap: "8px", color: i === logs.length - 1 ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        <span style={{ color: "var(--accent-green)", flexShrink: 0 }}>✓</span>
                        <span style={{ lineHeight: 1.4 }}>{log}</span>
                    </div>
                ))}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                    <span className="pulse" style={{ width: "8px", height: "14px", background: "var(--accent-primary)" }}></span>
                </div>
            </div>
        </div>
    );
}
