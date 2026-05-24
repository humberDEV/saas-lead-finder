"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Zap, LayoutDashboard } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "./SidebarContext";
import { PLAN_LIMITS } from "@/lib/plans";

export default function MobileHeader() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");
  const { user } = useUser();
  const { credits, bonusTokens, plan } = useSidebar();
  const onDashboard = pathname.includes("/dashboard");
  const planLimit = PLAN_LIMITS[plan] ?? 5;
  const planCredits = credits ?? 0;
  const totalSearches = planCredits + bonusTokens;
  const outOfCredits = credits !== null && totalSearches <= 0;
  const isLow =
    credits !== null && totalSearches > 0 && planCredits / planLimit <= 0.2 && bonusTokens === 0;

  const displayName = user?.firstName || user?.username || "User";

  return (
    <header className="md:hidden h-12 shrink-0 flex items-center justify-between px-4 bg-[#0c0c14] border-b border-white/[0.05]">
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/search" className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="font-black text-white text-sm tracking-tight">
            Hunt<span className="text-indigo-400">ly</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          aria-label={t("dashboard")}
          title={t("dashboard")}
          className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors shrink-0 ${
            onDashboard
              ? "bg-indigo-500/20 border-indigo-500/35 text-indigo-300"
              : "bg-white/[0.04] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.07]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={onDashboard ? 2.2 : 1.75} />
        </Link>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
            {planCredits}
            {bonusTokens > 0 ? `+${bonusTokens}` : ""}/{planLimit}
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
