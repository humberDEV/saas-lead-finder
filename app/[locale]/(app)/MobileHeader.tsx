"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Zap, LayoutDashboard } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "./SidebarContext";
import { PLAN_LIMITS } from "@/lib/plans";

export default function MobileHeader() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");
  const tSidebar = useTranslations("sidebar");
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
    <header className="md:hidden h-12 shrink-0 flex items-center justify-between px-4 bg-[#090b0d] border-b border-[#2d3236]">
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/search" className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Huntly<span className="text-indigo-400">.</span></span>
        </Link>
        <Link
          href="/dashboard"
          aria-label={t("dashboard")}
          title={t("dashboard")}
          className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors shrink-0 ${
            onDashboard
              ? "bg-violet-500/10 border-violet-500/40 text-violet-300"
              : "bg-transparent border-[#2d3236] text-zinc-500 hover:text-zinc-100 hover:bg-[#1e2225]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={onDashboard ? 2.2 : 1.75} />
        </Link>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Credits pill */}
        {credits !== null && (
          <span
            className={`text-[11px] font-medium tabular-nums px-2 py-0.5 ${
              outOfCredits
                ? "text-red-400"
                : isLow
                ? "text-amber-400"
                : "text-zinc-400"
            }`}
          >
            {planCredits}/{planLimit}{bonusTokens > 0 ? ` +${bonusTokens}` : ""}
          </span>
        )}

        {/* Upgrade shortcut for free users */}
        {plan === "free" && (
          <Link
            href="/pricing"
            className="flex items-center gap-1 border-l border-[#2d3236] pl-2 text-[11px] font-medium text-indigo-300 transition-colors"
          >
            <Zap className="w-2.5 h-2.5" />
            {tSidebar("upgrade")}
          </Link>
        )}

        {/* Avatar */}
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{displayName[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
    </header>
  );
}
