"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, MapPin, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "../SidebarContext";

interface HistoryItem {
  id: string;
  niche: string;
  city: string;
  result_count: number;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7)   return `hace ${days}d`;
  return `hace ${Math.floor(days / 7)}sem`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { plan, credits: sidebarCredits, setPendingHistoryId, historyVersion } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (sidebarCredits === null || plan === "free") return;
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setHistory(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, [historyVersion, sidebarCredits, plan]);

  const handleReplay = (id: string) => {
    setPendingHistoryId(id);
    router.push("/search");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0b0917] text-white">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h1 className="text-base font-black text-white">Historial</h1>
          </div>
          <p className="text-xs text-zinc-500">Tus búsquedas recientes — toca una para recargar los resultados.</p>
        </div>

        {plan === "free" ? (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Lock className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <p className="text-base font-black text-white mb-2">Desbloquea el historial</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                Guarda y relanza búsquedas anteriores con un plan de pago. Accede a tus leads cuando quieras, sin repetir la búsqueda.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-[0_2px_12px_rgba(99,102,241,0.3)]"
              >
                Ver planes
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-[10px] text-zinc-600">Desde $9/mes · cancela cuando quieras</p>
            </div>
          </div>
        ) : loading ? (
          /* Skeleton */
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Aún no hay búsquedas</p>
              <p className="text-xs text-zinc-500">Haz tu primera búsqueda y aparecerá aquí.</p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Buscar ahora
            </Link>
          </div>
        ) : (
          /* History list */
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleReplay(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.05] hover:border-indigo-500/20 transition-all text-left group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">
                    {item.niche}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span className="text-xs text-zinc-500 truncate">{item.city}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-600">{timeAgo(item.created_at)}</span>
                  </div>
                </div>

                {/* Result count + arrow */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.result_count > 0 && (
                    <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded-lg">
                      {item.result_count}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
