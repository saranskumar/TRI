"use client";

import { TriageInput } from "../types/triage";

interface PatientFormProps {
    data: TriageInput;
    onChange: (field: keyof TriageInput, value: number) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export default function PatientForm({ data, onChange, onSubmit, isLoading }: PatientFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange(name as keyof TriageInput, Number(value));
    };

    return (
        <div className="glass-panel rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2 flex items-center justify-between">
                Live Patient Vitals
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    TELEMETRY ACTIVE
                </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">AGE</label>
                    <input
                        type="number" name="age" value={data.age || ""} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">INJURY (0-2)</label>
                    <select
                        name="injury" value={data.injury} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                        <option value={0}>0 - None</option>
                        <option value={1}>1 - Minor</option>
                        <option value={2}>2 - Major</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">PAIN (0-2)</label>
                    <select
                        name="pain" value={data.pain} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                        <option value={0}>0 - None</option>
                        <option value={1}>1 - Mild</option>
                        <option value={2}>2 - Severe</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">MENTAL STATE</label>
                    <select
                        name="mental_state" value={data.mental_state} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                        <option value={0}>0 - Alert</option>
                        <option value={1}>1 - Altered</option>
                        <option value={2}>2 - Unresponsive</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">SBP (mmHg)</label>
                    <input
                        type="number" name="sbp" value={data.sbp || ""} onChange={handleChange}
                        className={`w-full bg-slate-900 border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 ${data.sbp < 90 ? "border-red-500 text-red-400" : "border-slate-600"}`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">HR (BPM)</label>
                    <input
                        type="number" name="heart_rate" value={data.heart_rate || ""} onChange={handleChange}
                        className={`w-full bg-slate-900 border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 ${data.heart_rate > 150 || data.heart_rate < 40 ? "border-red-500 text-red-400" : "border-slate-600"}`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">RR (Hz)</label>
                    <input
                        type="number" name="resp_rate" value={data.resp_rate || ""} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">TEMP (°F)</label>
                    <input
                        type="number" step="0.1" name="temperature" value={data.temperature || ""} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">SPO2 (%)</label>
                    <input
                        type="number" name="spo2" value={data.spo2 || ""} onChange={handleChange}
                        className={`w-full bg-slate-900 border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 ${data.spo2 < 90 ? "border-red-500 text-red-400" : "border-slate-600"}`}
                    />
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${isLoading
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    }`}
            >
                {isLoading ? (
                    <span className="animate-pulse">RUNNING ASSESSMENT...</span>
                ) : (
                    <>
                        RUN TRI ASSESSMENT
                        <div className="w-2 h-2 rounded-full bg-white animate-ping ml-2" />
                    </>
                )}
            </button>
        </div>
    );
}
