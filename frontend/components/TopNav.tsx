"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings, User } from "lucide-react";

export default function TopNav() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Subjects", path: "/subjects" },
        { name: "Planner", path: "/planner" },
        { name: "Practice", path: "/practice" },
        { name: "Assistant", path: "/assistant" },
        { name: "Analytics", path: "/analytics" },
    ];

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "64px",
                padding: "0 24px",
                background: "var(--bg-primary)",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "var(--accent-primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "18px",
                        }}
                    >
                        T
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>TRI</span>
                </Link>

                {/* Navigation Links */}
                <div style={{ display: "flex", gap: "24px", marginLeft: "20px" }}>
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                href={link.path}
                                style={{
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                                    position: "relative",
                                    transition: "color 0.2s",
                                }}
                            >
                                {link.name}
                                {isActive && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "-21px",
                                            left: 0,
                                            right: 0,
                                            height: "3px",
                                            background: "var(--accent-primary)",
                                            borderRadius: "3px 3px 0 0",
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "var(--text-secondary)" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><Search size={20} className="hover:text-[var(--accent-primary)] transition-colors" /></button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", position: "relative" }}>
                    <Bell size={20} className="hover:text-[var(--accent-primary)] transition-colors" />
                    <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "var(--accent-red)", borderRadius: "50%" }}></span>
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><Settings size={20} className="hover:text-[var(--accent-primary)] transition-colors" /></button>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <User size={18} />
                </div>
            </div>
        </nav>
    );
}
