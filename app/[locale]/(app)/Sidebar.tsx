"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles, ChevronLeft, ChevronRight,
  Clock, Briefcase, Search, Settings,
  LayoutDashboard, Zap, MonitorPlay,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "./SidebarContext";
import { PLAN_LIMITS as PLAN_LIMITS_CONFIG } from "@/lib/plans";

interface HistoryItem {
  id: string;
  niche: string;
  city: string;
  result_count: number;
  created_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const PLAN_LIMITS = PLAN_LIMITS_CONFIG;

function useTimeAgo() {
  const t = useTranslations("dashboard.timeAgo");
  return (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return t("minutes", { count: mins });
    if (hours < 24) return t("hours", { count: hours });
    if (days < 7) return t("days", { count: days });
    return t("weeks", { count: Math.floor(days / 7) });
  };
}

function formatPlanLabel(plan: string) {
  if (plan === "free") return "Free";
  if (plan === "go") return "Go";
  if (plan === "pro") return "Pro";
  if (plan === "agency") return "Agency";
  return plan;
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({
  href,
  icon,
  label,
  active,
  isOpen,
  accent = "indigo",
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  accent?: "indigo" | "violet";
  onClick?: () => void;
}) {
  const activeMap = {
    indigo:
      "bg-indigo-500/12 text-indigo-300 border border-indigo-500/20 shadow-[0_0_16px_rgba(99,102,241,0.08)]",
    violet:
      "bg-violet-500/12 text-violet-300 border border-violet-500/20 shadow-[0_0_16px_rgba(139,92,246,0.08)]",
  };
  const idleClass =
    "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent";

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-xl transition-all px-3 py-2.5 cursor-pointer select-none ${
        isOpen ? "" : "justify-center"
      } ${active ? activeMap[accent] : idleClass}`}
    >
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className="text-sm font-medium truncate">{label}</span>}
    </div>
  );

  if (onClick) return <button type="button" onClick={onClick} className="w-full text-left">{inner}</button>;
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ── Desktop sidebar only (mobile uses MobileNav) ─────────────────────────────
export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslations("sidebar");
  const { user } = useUser();
  const { credits, bonusTokens, plan, historyVersion, setPendingHistoryId, triggerNewSearch } = useSidebar();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const timeAgo = useTimeAgo();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]));
  }, [historyVersion]);

  const displayName = user?.firstName || user?.username || "User";
  const planLimit = PLAN_LIMITS[plan] ?? 5;
  const planCredits = credits ?? 0;
  const totalSearches = planCredits + bonusTokens;
  const creditsPct =
    credits !== null ? Math.min(100, Math.round((planCredits / planLimit) * 100)) : 0;
  const outOfCredits = credits !== null && totalSearches <= 0;
  const isLow = credits !== null && totalSearches > 0 && creditsPct <= 20 && bonusTokens === 0;

  const isDashboard = pathname.includes("/dashboard");
  const isSearch = pathname.includes("/search");
  const isCrm = pathname.includes("/crm");
  const isDemos = pathname.includes("/demos");

  const handleNewSearch = () => {
    if (isSearch) triggerNewSearch();
    else router.push("/search");
  };

  const handleSelectHistory = (id: string) => {
    setPendingHistoryId(id);
    if (!isSearch) router.push("/search");
  };

  return (
    <aside
      className={`
        ${isOpen ? "w-[17.5rem]" : "w-[3.5rem]"}
        h-screen bg-[#07070a] border-r border-black/50 backdrop-blur-xl
        flex flex-col shrink-0
        transition-[width] duration-200 ease-in-out overflow-hidden
      `}
    >
      {/* Logo + toggle */}
      <div
        className={`h-14 flex items-center shrink-0 border-b border-neutral-800/50 ${
          isOpen ? "px-4 gap-2" : "justify-center"
        }`}
      >
        {isOpen && (
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0 group">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 group-hover:text-indigo-300 transition-colors" />
            <span className="font-bold text-white text-sm tracking-tight">
              Hunt<span className="text-indigo-400">ly</span>
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-slate-600 hover:text-slate-300 shrink-0"
          title={isOpen ? t("collapse") : t("expand")}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* User + credits */}
      <div
        className={`border-b border-neutral-800/50 shrink-0 ${
          isOpen ? "px-4 py-4" : "px-2 py-4 flex justify-center"
        }`}
      >
        {isOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-[#0b0b12] object-cover shrink-0 select-none pointer-events-none"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600/80 flex items-center justify-center ring-2 ring-indigo-500/20 shrink-0 select-none">
                  <span className="text-xs font-bold text-white">
                    {displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
                <span
                  className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    plan === "free"
                      ? "bg-neutral-800 text-slate-500"
                      : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                  }`}
                >
                  {formatPlanLabel(plan)}
                </span>
              </div>
            </div>
            {credits !== null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-500">{t("searchesRemaining")}</span>
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      outOfCredits ? "text-red-400" : isLow ? "text-amber-400" : "text-slate-400"
                    }`}
                  >
                    {planCredits}
                    {bonusTokens > 0 ? (
                      <span className="text-emerald-400">+{bonusTokens}</span>
                    ) : null}
                    /{planLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      outOfCredits
                        ? "bg-red-500"
                        : isLow
                        ? "bg-amber-500"
                        : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    }`}
                    style={{ width: `${creditsPct}%` }}
                  />
                </div>
                {bonusTokens > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      <Sparkles className="w-2.5 h-2.5" />
                      +{bonusTokens} bonus
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full ring-1 ring-indigo-500/30 object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/80 flex items-center justify-center select-none">
              <span className="text-[11px] font-bold text-white">{displayName[0]?.toUpperCase()}</span>
            </div>
          )
        )}
      </div>

      {/* Nueva búsqueda */}
      <div className={`py-4 shrink-0 ${isOpen ? "px-4" : "px-2"}`}>
        <button
          type="button"
          onClick={handleNewSearch}
          className={`flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] ${
            isOpen ? "w-full px-4 py-2.5 justify-center" : "w-10 h-10 justify-center mx-auto"
          }`}
          title={t("newSearch")}
        >
          <Search className="w-4 h-4 shrink-0" />
          {isOpen && <span>{t("newSearch")}</span>}
        </button>
      </div>

      {/* Nav */}
      <div className={`shrink-0 ${isOpen ? "px-4 pb-3" : "px-2 pb-3"}`}>
        <div className="space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={isDashboard}
            isOpen={isOpen}
            accent="indigo"
          />
          <NavItem
            href="/crm"
            icon={<Briefcase className="w-4 h-4" />}
            label={t("portfolio")}
            active={isCrm}
            isOpen={isOpen}
            accent="violet"
          />
          <NavItem
            href="/demos"
            icon={<MonitorPlay className="w-4 h-4" />}
            label="Demos"
            active={isDemos}
            isOpen={isOpen}
            accent="violet"
          />
        </div>
      </div>

      {/* Historial */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {isOpen ? (
          <>
            <div className="flex items-center justify-between px-4 pb-2 shrink-0">
              <p className="text-xs font-semibold text-slate-500">{t("history")}</p>
              {history.length > 0 && (
                <span className="text-[10px] text-slate-600 tabular-nums">{history.length}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-2 scrollbar-thin">
              {plan === "free" ? (
                <Link
                  href="/pricing"
                  className="block text-xs text-amber-400/80 px-3 py-5 text-center leading-relaxed hover:text-amber-300 transition-colors border border-dashed border-amber-500/25 rounded-xl bg-amber-500/[0.04]"
                >
                  {t("historyLocked")}
                </Link>
              ) : history.length === 0 ? (
                <p className="text-xs text-slate-600 px-2 py-6 text-center leading-relaxed">
                  {t("historyEmpty")}
                </p>
              ) : (
                <div className="space-y-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectHistory(item.id)}
                      className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-neutral-800/80 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-800/60 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/10 transition-colors">
                        <Search className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-slate-300 line-clamp-2 leading-snug break-words group-hover:text-white transition-colors">
                          {item.niche}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{item.city}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(item.created_at)}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 tabular-nums bg-neutral-800/80 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5">
                        {item.result_count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fade al final del scroll */}
            {history.length > 4 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0b0b12] to-transparent shrink-0" />
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/[0.05] transition-colors mx-auto mt-2 text-slate-600 hover:text-slate-400"
            title={t("viewHistory")}
          >
            <Clock className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Footer */}
      <div
        className={`border-t border-neutral-800/60 shrink-0 ${
          isOpen ? "px-4 py-3 space-y-1" : "px-2 py-3 flex flex-col items-center gap-1"
        }`}
      >
        {plan === "free" && !outOfCredits && (
          <Link
            href="/pricing"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-all text-amber-400 hover:text-amber-300 ${
              !isOpen && "justify-center w-10 h-10"
            }`}
            title={t("upgrade")}
          >
            <Zap className="w-4 h-4 shrink-0" />
            {isOpen && <span className="text-xs font-semibold">{t("upgrade")}</span>}
          </Link>
        )}
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
            pathname.includes("/settings")
              ? "bg-white/[0.05] text-slate-200"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
          } ${!isOpen && "justify-center w-10 h-10"}`}
          title={t("settings")}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-sm font-medium">{t("settings")}</span>}
        </Link>
      </div>

      {outOfCredits && isOpen && (
        <div className="border-t border-neutral-800/50 px-4 py-3 shrink-0">
          <Link
            href="/pricing"
            className="flex items-center justify-between px-3 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/15 rounded-xl transition-colors"
          >
            <span className="text-xs font-semibold text-red-400">{t("noSearches")}</span>
            <span className="text-xs font-semibold text-red-300">{t("upgrade")} →</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
