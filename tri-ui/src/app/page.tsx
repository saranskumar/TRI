import Link from "next/link";
import { Activity, Ambulance, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4">
          <Activity className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          TRI System
        </h1>
        <p className="text-xl text-slate-400 font-medium">
          Triage Response Intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/ambulance"
          className="group flex flex-col items-center p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all duration-200 hover:border-blue-500"
        >
          <Ambulance className="h-12 w-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold text-white mb-2">Ambulance Console</h2>
          <p className="text-slate-400 text-center text-sm">
            Triage vitals capture, AI severity assessment, and hospital recommendations.
          </p>
        </Link>

        <Link
          href="/hospital"
          className="group flex flex-col items-center p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all duration-200 hover:border-blue-500"
        >
          <Building2 className="h-12 w-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold text-white mb-2">Hospital Dashboard</h2>
          <p className="text-slate-400 text-center text-sm">
            Live emergency tracking and incoming pre-arrival notifications.
          </p>
        </Link>
      </div>
    </div>
  );
}
