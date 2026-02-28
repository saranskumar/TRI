import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRI – AI Academic Automation Agent",
  description: "Transform fragmented student preparation into an intelligent, personalized learning workflow powered by Gemini AI.",
};

import TopNav from "@/components/TopNav";
import LeftSidebar from "@/components/LeftSidebar";
import BottomDock from "@/components/BottomDock";
import SystemActivity from "@/components/SystemActivity";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <TopNav />
        <div style={{ display: "flex", flex: 1, overflow: "hidden", background: "var(--bg-primary)" }}>
          <LeftSidebar />
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
              {children}
            </main>
            <SystemActivity />
          </div>
        </div>
        <BottomDock />
      </body>
    </html>
  );
}
