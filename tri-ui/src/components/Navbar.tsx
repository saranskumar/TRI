"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Ambulance, Building2 } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-white">
                    <Activity className="h-6 w-6 text-blue-500" />
                    <span className="text-xl font-bold tracking-tight">
                        TRI <span className="text-slate-400 font-normal">System</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link
                        href="/ambulance"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-400 ${pathname === "/ambulance" ? "text-blue-500" : "text-slate-300"}`}
                    >
                        <Ambulance className="h-4 w-4" />
                        Ambulance Console
                    </Link>
                    <Link
                        href="/hospital"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-400 ${pathname === "/hospital" ? "text-blue-500" : "text-slate-300"}`}
                    >
                        <Building2 className="h-4 w-4" />
                        Hospital Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
}
