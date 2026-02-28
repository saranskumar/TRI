"use client";
import { useState, useEffect } from "react";
import { Play, Pause, Square, CheckCircle, RefreshCw } from "lucide-react";

export default function BottomDock() {
    const [isActive, setIsActive] = useState(false);
    const [time, setTime] = useState(0); // in seconds
    const [sessionMsg, setSessionMsg] = useState("Ready to start focus session");

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setTime((time) => time + 1);
            }, 1000);
            setSessionMsg("TRI is monitoring your focus session");
        } else if (!isActive && time !== 0) {
            clearInterval(interval);
            setSessionMsg("Session paused");
        }
        return () => clearInterval(interval);
    }, [isActive, time]);

    const formatTime = (totalSeconds: number) => {
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const handleStop = () => {
        setIsActive(false);
        setTime(0);
        setSessionMsg("TRI updated your learning strategy based on progress");
        setTimeout(() => setSessionMsg("Ready to start focus session"), 4000);
    };

    return (
        <div
            style={{
                height: "60px",
                background: "var(--bg-card)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                position: "sticky",
                bottom: 0,
                zIndex: 50,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Current Subject</span>
                    <select style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "14px", outline: "none", cursor: "pointer", marginLeft: "-4px" }}>
                        <option>Database Management</option>
                        <option>Operating Systems</option>
                        <option>Computer Networks</option>
                    </select>
                </div>

                <div style={{ width: "1px", height: "24px", background: "var(--border)", margin: "0 8px" }} />

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Topic</span>
                    <select style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "14px", outline: "none", cursor: "pointer", marginLeft: "-4px" }}>
                        <option>Normalization (1NF, 2NF)</option>
                        <option>SQL Subqueries</option>
                        <option>ACID Properties</option>
                    </select>
                </div>
            </div>

            {/* Center AI Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-primary)", padding: "6px 16px", borderRadius: "999px", border: "1px solid var(--border)" }}>
                {isActive ? <RefreshCw size={14} className="pulse" color="var(--accent-primary)" /> : <CheckCircle size={14} color="var(--accent-green)" />}
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>{sessionMsg}</span>
            </div>

            {/* Right Timer Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: isActive ? "var(--accent-primary)" : "var(--text-primary)", width: "65px" }}>
                    {formatTime(time)}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => setIsActive(!isActive)}
                        style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: isActive ? "var(--bg-secondary)" : "var(--accent-primary)",
                            color: isActive ? "var(--text-primary)" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "none", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: "2px" }} />}
                    </button>

                    <button
                        onClick={handleStop}
                        disabled={time === 0}
                        style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "var(--bg-secondary)", color: time === 0 ? "var(--text-secondary)" : "var(--accent-red)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "none", cursor: time === 0 ? "not-allowed" : "pointer",
                            opacity: time === 0 ? 0.5 : 1, transition: "all 0.2s"
                        }}
                    >
                        <Square size={14} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}
