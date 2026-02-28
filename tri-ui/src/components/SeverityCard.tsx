"use client";

import { AlertOctagon, AlertTriangle, CheckCircle } from "lucide-react";
import { TriageResponse } from "../types/triage";

interface SeverityCardProps {
    result: TriageResponse;
}

export default function SeverityCard({ result }: SeverityCardProps) {
    const isHigh = result.severity === "HIGH";
    const isMedium = result.severity === "MEDIUM";
    const isLow = result.severity === "LOW";

    const glowClass = isHigh ? "glow-red border-red-500/50" : isMedium ? "glow-yellow border-yellow-500/50" : "glow-green border-green-500/50";
    const textClass = isHigh ? "text-red-500" : isMedium ? "text-yellow-500" : "text-green-500";
    const bgClass = isHigh ? "bg-red-500/10" : isMedium ? "bg-yellow-500/10" : "bg-green-500/10";

    return (
        <div className={`glass-panel border-2 rounded-xl p-6 mb-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${glowClass}`}>
            <div className="flex items-start justify-between mb-4 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${bgClass}`}>
                        {isHigh && <AlertOctagon className="w-8 h-8 text-red-500" />}
                        {isMedium && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
                        {isLow && <CheckCircle className="w-8 h-8 text-green-500" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-mono text-slate-400 mb-1">AI SEVERITY ASSESSMENT</h2>
                        <div className={`text-4xl font-extrabold tracking-tight uppercase ${textClass}`}>
                            {result.severity}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-slate-400 mb-1">PROBABILITY</div>
                    <div className="text-2xl font-bold text-white">
                        {(result.probability * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-mono text-slate-400 mb-2">KEY FACTORS IDENTIFIED</h3>
                    <ul className="space-y-2">
                        {result.key_factors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                                <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${isHigh ? "bg-red-500" : "bg-blue-400"}`} />
                                {factor}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-mono text-slate-400 mb-2">REQUIRED FACILITY</h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-lg font-bold text-slate-200">
                        {result.required_facility}
                    </div>
                </div>
            </div>
        </div>
    );
}
