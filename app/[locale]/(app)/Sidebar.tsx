"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles, ChevronLeft, ChevronRight,
  Clock, Briefcase, Search, Settings,
  LayoutDashboard, Zap,
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
  accent?: "indigo" | "violet" | "amber" | "emerald";
  onClick?: () => void;
}) {
  const accentMap = {
    indigo: "border-indigo-500 bg-indigo-500/10 text-indigo-300",
    violet: "border-violet-500 bg-violet-500/10 text-violet-300",
    amber:  "border-amber-500 bg-amber-500/10 text-amber-300",
    emerald:"border-emerald-500 bg-emerald-500/10 text-emerald-300",
  };
  const activeClass = active ? `border-l-2 ${accentMap[accent]}` : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]";

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-xl transition-all px-2.5 py-2.5 cursor-pointer select-none ${
        isOpen ? "" : "justify-center"
      } ${activeClass}`}
    >
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className={`text-sm font-semibold truncate ${active ? "" : ""}`}>{label}</span>}
    </div>
  );

  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslations("sidebar");
  const { user } = useUser();
  const { credits, plan, historyVersion, setPendingHistoryId, triggerNewSearch } = useSidebar();
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
  const creditsPct = credits !== null ? Math.min(100, Math.round((credits / planLimit) * 100)) : 0;
  const outOfCredits = credits !== null && credits <= 0;
  const isLow = credits !== null && credits > 0 && creditsPct <= 20;

  const isDashboard = pathname.includes("/dashboard");
  const isSearch    = pathname.includes("/search");
  const isCrm       = pathname.includes("/crm");

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
        ${isOpen ? "w-60" : "w-[56px]"}
        h-screen bg-[#0c0c14] border-r border-white/[0.05]
        flex flex-col shrink-0
        transition-all duration-200 ease-in-out overflow-hidden
      `}
    >
      {/* ── Logo + toggle ── */}
      <div className={`h-12 flex items-center shrink-0 border-b border-white/[0.05] ${isOpen ? "px-4 gap-2" : "justify-center"}`}>
        {isOpen && (
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-black text-white text-sm tracking-tight">
              Hunt<span className="text-indigo-400">ly</span>
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-600 hover:text-zinc-300 shrink-0"
          title={isOpen ? t("collapse") : t("expand")}
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── User + credits ── */}
      <div className={`border-b border-white/[0.05] shrink-0 ${isOpen ? "px-3 py-3" : "px-2 py-3 flex justify-center"}`}>
        {isOpen ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              {/* Custom avatar — not clickable */}
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full ring-1 ring-white/10 object-cover shrink-0 select-none pointer-events-none"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center ring-1 ring-white/10 shrink-0 select-none">
                  <span className="text-[11px] font-black text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                  plan === "free" ? "bg-zinc-800 text-zinc-500" : "bg-indigo-500/20 text-indigo-300"
                }`}>
                  {plan}
                </span>
              </div>
            </div>
            {credits !== null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-600">Búsquedas restantes</span>
                  <span className={`text-[10px] font-black ${outOfCredits ? "text-red-400" : isLow ? "text-amber-400" : "text-zinc-400"}`}>
                    {credits}/{planLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      outOfCredits ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${creditsPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="w-7 h-7 rounded-full ring-1 ring-white/10 object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center ring-1 ring-white/10 select-none">
              <span className="text-[11px] font-black text-white">{displayName[0]?.toUpperCase()}</span>
            </div>
          )
        )}
      </div>

      {/* ── Search button ── */}
      <div className={`py-3 shrink-0 ${isOpen ? "px-3" : "px-2"}`}>
        <button
          onClick={handleNewSearch}
          className={`flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-[0_2px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] ${
            isOpen ? "w-full px-4 py-2.5" : "w-9 h-9 justify-center mx-auto"
          }`}
          title={t("newSearch")}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          {isOpen && <span>{t("newSearch")}</span>}
        </button>
      </div>

      {/* ── Nav ── */}
      <div className={`shrink-0 ${isOpen ? "px-3 pb-2" : "px-2 pb-2"}`}>
        <div className="space-y-0.5">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active={isDashboard} isOpen={isOpen} accent="indigo" />
          <NavItem href="/crm" icon={<Briefcase className="w-4 h-4" />} label="Mi Cartera" active={isCrm} isOpen={isOpen} accent="violet" />
        </div>
      </div>

      {/* ── Historial ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-2">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2 px-1 mb-1.5 mt-1">
              <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex-1">Historial</p>
              <Clock className="w-2.5 h-2.5 text-zinc-700" />
            </div>
            {plan === "free" ? (
              <Link href="/pricing" className="block text-[11px] text-amber-500/70 px-2 py-4 text-center leading-relaxed hover:text-amber-400 transition-colors border border-dashed border-amber-500/20 rounded-xl">
                {t("historyLocked")}
              </Link>
            ) : history.length === 0 ? (
              <p className="text-[11px] text-zinc-700 px-2 py-4 text-center">{t("historyEmpty")}</p>
            ) : (
              <div className="space-y-0.5">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistory(item.id)}
                    className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left group"
                  >
                    <Clock className="w-2.5 h-2.5 text-zinc-700 shrink-0 mt-0.5 group-hover:text-zinc-500 transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-zinc-400 truncate leading-tight group-hover:text-zinc-200 transition-colors">
                        {item.niche} · {item.city}
                      </p>
                      <p className="text-[9px] text-zinc-700 mt-0.5">{timeAgo(item.created_at)}</p>
                    </div>
                    <span className="text-[9px] text-zinc-700 shrink-0">{item.result_count}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors mx-auto text-zinc-700 hover:text-zinc-400"
            title={t("viewHistory")}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Bottom: upgrade hint + settings ── */}
      <div className={`border-t border-white/[0.08] bg-[#0a0a12] py-2 shrink-0 ${isOpen ? "px-3 space-y-1" : "px-2 flex flex-col items-center gap-1"}`}>
        {plan === "free" && !outOfCredits && (
          <Link
            href="/pricing"
            className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-amber-500/8 hover:bg-amber-500/15 border border-amber-500/15 hover:border-amber-500/30 transition-all text-amber-400 hover:text-amber-300 ${!isOpen && "justify-center w-9 h-9"}`}
            title={t("upgrade")}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            {isOpen && <span className="text-xs font-bold">{t("upgrade")}</span>}
          </Link>
        )}
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-500 hover:text-zinc-200 ${!isOpen && "justify-center w-9 h-9"} ${pathname.includes("/settings") ? "bg-white/[0.04] text-zinc-200" : ""}`}
          title="Configuración"
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          {isOpen && <span className="text-xs">Configuración</span>}
        </Link>
      </div>

      {/* ── Sin créditos banner ── */}
      {outOfCredits && isOpen && (
        <div className="border-t border-white/[0.05] px-3 py-2.5 shrink-0">
          <Link
            href="/pricing"
            className="flex items-center justify-between px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 rounded-xl transition-colors"
          >
            <span className="text-xs font-bold text-red-400">{t("noSearches")}</span>
            <span className="text-xs font-bold text-red-300">{t("upgrade")} →</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
