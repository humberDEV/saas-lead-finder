"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Sparkles, ChevronLeft, ChevronRight, Plus,
  Clock, Briefcase, Zap, Search, CreditCard,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return `hace ${Math.floor(days / 7)}sem`;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useUser();
  const { credits, plan, historyVersion, setPendingHistoryId, triggerNewSearch } = useSidebar();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]));
  }, [historyVersion]);

  const displayName = user?.firstName || user?.username || "Usuario";
  const outOfCredits = credits !== null && credits <= 0;

  const handleNewSearch = () => {
    if (pathname === "/dashboard") {
      triggerNewSearch();
    } else {
      router.push("/dashboard");
    }
  };

  const handleSelectHistory = (id: string) => {
    setPendingHistoryId(id);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  return (
    <aside
      className={`
        ${isOpen ? "w-60" : "w-14"}
        h-screen bg-[#0f0f17] border-r border-white/[0.05]
        flex flex-col shrink-0
        transition-all duration-200 ease-in-out overflow-hidden
      `}
    >
      {/* ── Header: logo + toggle ── */}
      <div className="h-12 flex items-center px-3 border-b border-white/[0.05] shrink-0 gap-2">
        {isOpen && (
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-bold text-white text-sm tracking-tight">
              Hunt<span className="text-indigo-400">ly</span>
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-white shrink-0 ${!isOpen && "mx-auto"}`}
          title={isOpen ? "Contraer" : "Expandir"}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* ── User section ── */}
      <div className={`border-b border-white/[0.05] shrink-0 ${isOpen ? "px-3 py-3" : "px-2 py-3 flex justify-center"}`}>
        {isOpen ? (
          <div className="flex items-center gap-2.5">
            <UserButton
              appearance={{
                elements: { avatarBox: "w-8 h-8 ring-1 ring-white/10" },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {/* Plan badge */}
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded leading-none ${
                    plan === "free"
                      ? "bg-zinc-800 text-zinc-400"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {plan}
                </span>

                {/* Credits badge */}
                {credits !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                      outOfCredits
                        ? "bg-red-500/20 text-red-300"
                        : "bg-indigo-500/20 text-indigo-300"
                    }`}
                  >
                    <Search className="w-3 h-3 shrink-0" />
                    {credits} búsquedas
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8 ring-1 ring-white/10" },
            }}
          />
        )}
      </div>

      {/* ── Nueva búsqueda ── */}
      <div className={`py-3 shrink-0 ${isOpen ? "px-3" : "px-2"}`}>
        <button
          onClick={handleNewSearch}
          className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-semibold text-sm ${
            isOpen ? "w-full px-4 py-2.5" : "w-10 h-10 justify-center mx-auto"
          }`}
          title="Nueva búsqueda"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {isOpen && <span>Nueva búsqueda</span>}
        </button>
      </div>

      {/* ── Historial ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-2">
        {isOpen ? (
          <>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 mb-1.5">
              Historial
            </p>
            {plan === "free" ? (
              <Link
                href="/pricing"
                className="block text-xs text-amber-400/80 px-2 py-6 text-center leading-relaxed hover:text-amber-300 transition-colors"
              >
                🔒 Historial disponible en planes de pago
              </Link>
            ) : history.length === 0 ? (
              <p className="text-xs text-zinc-600 px-2 py-6 text-center leading-relaxed">
                Tus búsquedas anteriores aparecerán aquí
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <Clock className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5 group-hover:text-zinc-400 transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-300 truncate leading-tight">
                      {item.niche} en {item.city}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors mx-auto text-zinc-600 hover:text-white"
            title="Ver historial"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav links ── */}
      <div className="border-t border-white/[0.05] py-2 px-2 shrink-0 space-y-0.5">
        <Link
          href="/crm"
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white ${!isOpen && "justify-center"}`}
          title="Mi Cartera"
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-sm">Mi Cartera</span>}
        </Link>
        {plan !== "free" ? (
          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white ${!isOpen && "justify-center"}`}
            title="Gestionar suscripción"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            {isOpen && <span className="text-sm">Gestionar plan</span>}
          </button>
        ) : (
          <Link
            href="/pricing"
            className={`flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-amber-400 hover:text-amber-300 ${!isOpen && "justify-center"}`}
            title="Upgrade"
          >
            <Zap className="w-4 h-4 shrink-0" />
            {isOpen && <span className="text-sm font-semibold">Upgrade</span>}
          </Link>
        )}
      </div>

      {/* ── Bottom: show CTA only when out of credits ── */}
      {outOfCredits && (
        <div className={`border-t border-white/[0.05] shrink-0 ${isOpen ? "px-3 py-3" : "px-2 py-3"}`}>
          <Link
            href="/pricing"
            className={`flex items-center justify-between gap-2 rounded-xl transition-colors ${
              isOpen
                ? "px-3 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
                : "w-10 h-10 justify-center mx-auto bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
            }`}
            title="Sin búsquedas — Upgrade"
          >
            {isOpen ? (
              <>
                <span className="text-xs font-bold text-red-400">Sin búsquedas</span>
                <span className="text-xs font-bold text-red-300 whitespace-nowrap">Upgrade →</span>
              </>
            ) : (
              <Zap className="w-3.5 h-3.5 text-red-400" />
            )}
          </Link>
        </div>
      )}
    </aside>
  );
}
