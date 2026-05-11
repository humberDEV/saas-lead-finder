"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0A0A0A]">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
      </div>

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile top header */}
        <MobileHeader />

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

      </div>
    </div>
  );
}
