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
    <div className="huntly-app flex h-dvh overflow-hidden bg-[#060708] text-zinc-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
      </div>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#08090b] md:border-l md:border-[#2d3236]">
        <MobileHeader />

        <div className="flex-1 min-h-0 overflow-hidden md:p-2">
          <div className="h-full min-h-0 overflow-hidden md:rounded-md md:border md:border-[#2d3236] md:bg-[#0b0d0f]">
            {children}
          </div>
        </div>

        <MobileNav />
      </div>

      <ReferralPromptGate />
    </div>
  );
}
