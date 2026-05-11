"use client";

import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "./SidebarContext";
import { PLAN_LIMITS } from "@/lib/plans";

export default function MobileHeader() {
  const { user } = useUser();
  const { credits, plan } = useSidebar();
  const planLimit = PLAN_LIMITS[plan] ?? 5;
  const outOfCredits = credits !== null && credits <= 0;
  const isLow = credits !== null && credits > 0 && credits / planLimit <= 0.2;

  const displayName = user?.firstName || user?.username || "User";

  return (
    <header className="md:hidden h-12 shrink-0 flex items-center justify-between px-4 bg-[#0c0c14] border-b border-white/[0.05]">
      {/* Logo */}
      <Link href="/search" className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span className="font-black text-white text-sm tracking-tight">
          Hunt<span className="text-indigo-400">ly</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Credits pill */}
        {credits !== null && (
          <span
            className={`text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full ${
              outOfCredits
                ? "bg-red-500/15 text-red-400 border border-red-500/20"
                : isLow
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
            }`}
          >
            {credits}/{planLimit}
          </span>
        )}

        {/* Upgrade shortcut for free users */}
        {plan === "free" && (
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors"
          >
            <Zap className="w-2.5 h-2.5" />
            Upgrade
          </Link>
        )}

        {/* Avatar */}
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full ring-1 ring-white/10 object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center ring-1 ring-white/10">
            <span className="text-[10px] font-black text-white">{displayName[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
    </header>
  );
}
