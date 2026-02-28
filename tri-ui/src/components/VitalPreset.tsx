"use client";

import { Activity, Wind, AlertTriangle, UserCheck } from "lucide-react";
import { PresetName, TriageInput } from "../types/triage";

interface VitalPresetProps {
    onSelectPreset: (presetData: Partial<TriageInput>, name: PresetName) => void;
    activePreset: PresetName | null;
}

export default function VitalPreset({ onSelectPreset, activePreset }: VitalPresetProps) {
    // Common scenarios mapped to plausible vitals
    const presets: Record<PresetName, { icon: React.ReactNode, data: Partial<TriageInput> }> = {
        "Cardiac Emergency": {
            icon: <Activity className="w-5 h-5" />,
            data: {
                age: 65, injury: 0, pain: 2, mental_state: 1, sbp: 80, heart_rate: 155, resp_rate: 28, temperature: 98.6, spo2: 89
            }
        },
        "Respiratory Distress": {
            icon: <Wind className="w-5 h-5" />,
            data: {
                age: 42, injury: 0, pain: 1, mental_state: 0, sbp: 130, heart_rate: 110, resp_rate: 34, temperature: 101.2, spo2: 82
            }
        },
        "Trauma": {
            icon: <AlertTriangle className="w-5 h-5" />,
            data: {
                age: 28, injury: 2, pain: 2, mental_state: 2, sbp: 85, heart_rate: 130, resp_rate: 18, temperature: 97.5, spo2: 92
            }
        },
        "Stable Patient": {
            icon: <UserCheck className="w-5 h-5" />,
            data: {
                age: 35, injury: 0, pain: 0, mental_state: 0, sbp: 120, heart_rate: 75, resp_rate: 16, temperature: 98.6, spo2: 98
            }
        }
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-3">
                Quick Scenario Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(presets) as PresetName[]).map((name) => (
                    <button
                        key={name}
                        onClick={() => onSelectPreset(presets[name].data, name)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${activePreset === name
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                            : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                            }`}
                    >
                        <div className={`mb-2 ${activePreset === name ? "text-white" : "text-blue-500"}`}>
                            {presets[name].icon}
                        </div>
                        <span className="text-xs font-medium text-center">{name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
