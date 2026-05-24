"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";
import { ReferralPromptGate } from "@/components/referral/ReferralPromptGate";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#050508]">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
      </div>

      {/* Área principal — tono distinto + margen/canvas en desktop */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#0a0a10] md:border-l md:border-neutral-900/80 md:shadow-[-12px_0_40px_rgba(0,0,0,0.45)]">
        <MobileHeader />

        <div className="flex-1 min-h-0 overflow-hidden md:p-3">
          <div
            className="h-full min-h-0 overflow-hidden md:rounded-2xl md:border md:border-white/[0.06] md:bg-[#0c0c12] bg-[radial-gradient(ellipse_75%_60%_at_50%_-12%,rgba(99,102,241,0.07),transparent)]"
          >
            {children}
          </div>
        </div>

        <MobileNav />
      </div>

      <ReferralPromptGate />
    </div>
  );
}
