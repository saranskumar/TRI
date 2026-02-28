"use client";

import { useState, useEffect } from "react";
import IncomingAlert from "@/components/IncomingAlert";
import { Activity, Radio } from "lucide-react";

export default function HospitalDashboard() {
    const [alerts, setAlerts] = useState<Array<{ id: number, severity: any, facility: string, eta: number }>>([]);

    // Simulate an incoming patient shortly after opening the dashboard
    useEffect(() => {
        const timer = setTimeout(() => {
            setAlerts([
                { id: 1, severity: "HIGH", facility: "ICU / Trauma", eta: 8 }
            ]);
        }, 2500); // 2.5 seconds delay to simulate real-time notification

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        HOSPITAL DASHBOARD
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-widest flex items-center gap-2">
                        City Medical Center <span className="text-slate-600">•</span> ER Operations
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold font-mono text-green-400">RECEIVING NETWORK ON</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 border border-dashed border-slate-700 rounded-2xl relative overflow-hidden">

                {/* Background purely aesthetic pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none z-0"
                    style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {alerts.length === 0 ? (
                    <div className="text-center z-10 animate-pulse transition-all duration-1000">
                        <div className="inline-flex items-center justify-center p-6 bg-slate-800 rounded-full mb-6 relative">
                            <Radio className="h-12 w-12 text-slate-500" />
                            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-300 tracking-wide mb-2">LISTENING FOR TRIAGE SIGNALS</h2>
                        <p className="text-slate-500 font-mono text-sm max-w-sm mx-auto">
                            Scanning local emergency network for incoming ambulance telemetry...
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full max-w-3xl z-10 flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-slate-300 font-mono">ACTIVE INBOUND (1)</span>
                        </div>

                        {alerts.map(a => (
                            <IncomingAlert
                                key={a.id}
                                severity={a.severity}
                                facility={a.facility}
                                initialEta={a.eta}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
