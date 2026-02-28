"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, Activity, Check } from "lucide-react";

interface IncomingAlertProps {
    severity: "HIGH" | "MEDIUM" | "LOW";
    facility: string;
    initialEta: number; // in minutes
}

export default function IncomingAlert({ severity, facility, initialEta }: IncomingAlertProps) {
    const [eta, setEta] = useState(initialEta * 60); // convert to seconds for countdown

    useEffect(() => {
        if (eta <= 0) return;
        const interval = setInterval(() => {
            setEta((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [eta]);

    const isHigh = severity === "HIGH";
    const glowClass = isHigh ? "glow-red border-red-500/50" : severity === "MEDIUM" ? "glow-yellow border-yellow-500/50" : "glow-green border-green-500/50";
    const bgClass = isHigh ? "bg-red-500/10" : severity === "MEDIUM" ? "bg-yellow-500/10" : "bg-green-500/10";
    const textClass = isHigh ? "text-red-500" : severity === "MEDIUM" ? "text-yellow-500" : "text-green-500";

    const minutes = Math.floor(eta / 60);
    const seconds = eta % 60;

    return (
        <div className={`glass-panel border-l-4 rounded-xl p-6 mb-4 ${isHigh ? "border-l-red-500" : severity === "MEDIUM" ? "border-l-yellow-500" : "border-l-green-500"
            } ${glowClass} animate-in fade-in slide-in-from-right-8`}>

            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700/50">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl ${bgClass}`}>
                        <Activity className={`w-8 h-8 ${textClass}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Incoming Patient</h3>
                            {isHigh && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                                    CRITICAL
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-mono text-slate-400 flex items-center gap-2">
                            <span className={`font-bold ${textClass}`}>SEVERITY: {severity}</span>
                            <span>•</span>
                            <span>REQ: {facility}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> ETA
                    </div>
                    <div className={`text-4xl font-extrabold font-mono tracking-tighter ${eta < 180 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-mono text-slate-400 mb-3">PREPARATION STATUS</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="bg-green-500/20 p-1.5 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-300">
                            {facility} BAY RESERVED
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="bg-green-500/20 p-1.5 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-300">
                            TRAUMA TEAM NOTIFIED
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}
