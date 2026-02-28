"use client";

import { MapPin, Navigation, Building2 } from "lucide-react";
import { RecommendedHospital } from "../types/triage";

interface HospitalListProps {
    hospitals: RecommendedHospital[];
    onSelect: (hospital: RecommendedHospital) => void;
    selectedHospitalName: string | null;
}

export default function HospitalList({ hospitals, onSelect, selectedHospitalName }: HospitalListProps) {
    if (!hospitals || hospitals.length === 0) return null;

    return (
        <div className="glass-panel rounded-xl p-5 fade-in slide-in-from-bottom-6">
            <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4 flex items-center justify-between border-b border-slate-700 pb-2">
                <span>Recommended Destinations</span>
                <MapPin className="w-4 h-4" />
            </h3>

            <div className="space-y-3">
                {hospitals.map((hospital, idx) => {
                    const isSelected = selectedHospitalName === hospital.name;
                    const isTop = idx === 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => onSelect(hospital)}
                            className={`relative flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${isSelected
                                    ? "bg-blue-600/20 border-blue-500 glow-blue"
                                    : isTop
                                        ? "bg-slate-800 border-slate-600 hover:border-blue-400"
                                        : "bg-slate-900 border-slate-800 hover:border-slate-500"
                                }`}
                        >
                            {isTop && !isSelected && (
                                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                                    Best Match
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${isSelected ? "bg-blue-500" : "bg-slate-700"}`}>
                                    <Building2 className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-300"}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg leading-tight">{hospital.name}</h4>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                                            Score: {(hospital.score * 100).toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <div className="flex items-center gap-1 text-2xl font-bold text-slate-200">
                                    {hospital.eta_minutes}
                                    <span className="text-sm font-normal text-slate-400">m</span>
                                </div>
                                <div className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold flex items-center gap-1 mt-1">
                                    <Navigation className="w-3 h-3" /> ETA
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
