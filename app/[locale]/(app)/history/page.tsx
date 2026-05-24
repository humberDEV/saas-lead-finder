"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";
import { AppPageShell } from "@/components/AppPageShell";
import { FeatureUnlockScreen } from "@/components/FeatureUnlockScreen";

interface HistoryItem {
  id: string;
  niche: string;
  city: string;
  result_count: number;
  created_at: string;
}

export default function HistoryPage() {
  const t = useTranslations("historyPage");
  const tTimeAgo = useTranslations("dashboard.timeAgo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { plan, credits: sidebarCredits, setPendingHistoryId, historyVersion } = useSidebar();
  const router = useRouter();

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return tTimeAgo("minutes", { count: mins });
    if (hours < 24) return tTimeAgo("hours", { count: hours });
    if (days < 7) return tTimeAgo("days", { count: days });
    return tTimeAgo("weeks", { count: Math.floor(days / 7) });
  }

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

  if (plan === "free") {
    return <FeatureUnlockScreen feature="history" />;
  }

  return (
    <AppPageShell>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-white tracking-tight">
            {t("title")}
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] rounded-2xl border border-neutral-800/70 bg-neutral-900/35 animate-pulse"
            />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center rounded-2xl border border-neutral-800/70 bg-neutral-900/35 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">{t("emptyTitle")}</p>
            <p className="text-xs text-slate-500">{t("emptyDesc")}</p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            {t("searchNow")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              onClick={() => handleReplay(item.id)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-neutral-800/70 bg-neutral-900/35 backdrop-blur-xl hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.06)] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 line-clamp-2 break-words leading-snug group-hover:text-white transition-colors">
                  {item.niche}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="text-xs text-slate-500 line-clamp-1">{item.city}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-600">{timeAgo(item.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.result_count > 0 && (
                  <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-lg tabular-nums">
                    {item.result_count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </AppPageShell>
  );
}
