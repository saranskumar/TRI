"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Sparkles, BookOpen } from "lucide-react";

export default function AssistantPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<{ role: "user" | "ai", text: string, source?: string }[]>([
        { role: "ai", text: "Hello! I am TRI, your AI Academic Assistant. I have context on your syllabus and uploaded notes. What concept can I explain for you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);

        // Mock response for UI build
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "ai",
                text: `Based on your Database Management syllabus (Unit 2), ${userMsg} is a critical topic that often appears in internal exams. Here is a simplified breakdown:\n\n1. It helps eliminate redundancy.\n2. It ensures data dependencies make sense.\n\nKeep practicing this as it is currently marked as a weak area in your profile.`,
                source: "CL Scheme.pdf, Page 14"
            }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="fade-in" style={{ padding: "32px", maxWidth: "800px", margin: "0 auto", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                <div style={{ background: "var(--accent-primary)", padding: "10px", borderRadius: "12px", color: "white" }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                        TRI Doubt Hub
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Context-aware assistance using your syllabus and notes.</p>
                </div>
            </div>

            <div className="card-glow" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>

                        {msg.role === "ai" && (
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", flexShrink: 0 }}>
                                <Bot size={18} />
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                            <div style={{
                                padding: "16px 20px",
                                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                background: msg.role === "user" ? "var(--text-primary)" : "var(--bg-secondary)",
                                color: msg.role === "user" ? "var(--bg-primary)" : "var(--text-primary)",
                                fontSize: "15px",
                                lineHeight: 1.6,
                                border: msg.role === "ai" ? "1px solid var(--border)" : "none",
                                whiteSpace: "pre-wrap"
                            }}>
                                {msg.text}
                            </div>

                            {msg.source && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    <BookOpen size={12} /> Source: {msg.source}
                                </div>
                            )}
                        </div>

                        {msg.role === "user" && (
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
                                <User size={18} />
                            </div>
                        )}

                    </div>
                ))}
                {loading && (
                    <div style={{ display: "flex", gap: "16px", alignSelf: "flex-start" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", flexShrink: 0 }}>
                            <Bot size={18} />
                        </div>
                        <div style={{ padding: "16px 20px", borderRadius: "20px 20px 20px 4px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <div className="pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-secondary)" }} />
                            <div className="pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-secondary)", animationDelay: "0.2s" }} />
                            <div className="pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-secondary)", animationDelay: "0.4s" }} />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div style={{ position: "relative" }}>
                <input
                    autoFocus
                    className="input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask a doubt or request an explanation..."
                    style={{ padding: "18px 24px", paddingRight: "60px", fontSize: "15px", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    style={{
                        position: "absolute", right: "8px", top: "8px", bottom: "8px",
                        width: "44px", borderRadius: "10px", background: "var(--accent-primary)", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center", border: "none",
                        cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.5,
                        transition: "all 0.2s"
                    }}
                >
                    <Send size={18} />
                </button>
            </div>

        </div>
    );
}
