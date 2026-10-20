"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const { plan, credits, setPendingHistoryId, historyVersion } = useSidebar();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (credits === null || plan === "free") return;
    const controller = new AbortController();
    fetch("/api/history", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("load_failed"); return response.json(); })
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setError(false); })
      .catch((reason) => { if (reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [historyVersion, credits, plan]);

  const visibleHistory = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return history.filter((item) => !needle || `${item.niche} ${item.city}`.toLocaleLowerCase(locale).includes(needle));
  }, [history, query, locale]);

  const handleReplay = (id: string) => {
    setPendingHistoryId(id);
    router.push("/search");
  };

  if (plan === "free") return <FeatureUnlockScreen feature="history" />;

  return <AppPageShell>
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">Huntly / {t("title")}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
      </div>
      <Link href="/search" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-700 bg-[#1e2225] px-4 text-sm font-medium text-zinc-100 hover:border-neutral-500"><Plus className="h-4 w-4" />{t("searchNow")}</Link>
    </header>

    {loading ? <div className="space-y-2" aria-label={t("loading")}>{[0, 1, 2].map((index) => <div key={index} className="h-[72px] animate-pulse rounded-md border border-neutral-800 bg-[#141719]" />)}</div> : error ? <div className="rounded-lg border border-neutral-800 bg-[#141719] px-5 py-12 text-center text-sm text-zinc-400">{t("loadError")}</div> : history.length === 0 ? <section className="rounded-lg border border-neutral-800 bg-[#141719] px-6 py-12"><h2 className="text-lg font-semibold text-white">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-zinc-400">{t("emptyDesc")}</p><Link href="/search" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400"><Plus className="h-4 w-4" />{t("searchNow")}</Link></section> : <section aria-label={t("title")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{t("resultCount", { count: visibleHistory.length })}</p>
        <label className="relative block w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><span className="sr-only">{t("searchPlaceholder")}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="h-10 w-full rounded-md border border-neutral-800 bg-[#1b1f22] pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-400 focus:outline-none" /></label>
      </div>
      {visibleHistory.length === 0 ? <div className="rounded-lg border border-neutral-800 bg-[#141719] px-5 py-12 text-center text-sm text-zinc-500">{t("noMatches")}</div> : <div className="overflow-hidden rounded-lg border border-neutral-800 bg-[#141719]">
        <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_115px_95px_90px] gap-3 border-b border-neutral-800 bg-[#1b1f22] px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-zinc-500 lg:grid"><span>{t("nicheColumn")}</span><span>{t("zoneColumn")}</span><span>{t("dateColumn")}</span><span>{t("resultsColumn")}</span><span className="sr-only">{t("openSearch")}</span></div>
        <div className="divide-y divide-neutral-800">
          {visibleHistory.map((item) => {
            const date = new Date(item.created_at).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { day: "numeric", month: "short", year: "numeric" });
            return <button key={item.id} type="button" onClick={() => handleReplay(item.id)} className="group flex min-h-16 w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_115px_95px_90px] lg:items-center lg:gap-3">
              <span className="truncate text-sm font-medium text-zinc-100">{item.niche}</span>
              <span className="truncate text-xs text-zinc-500">{item.city}</span>
              <span className="hidden text-xs text-zinc-500 lg:block">{date}</span>
              <span className="hidden font-mono text-xs tabular-nums text-zinc-400 lg:block">{item.result_count}</span>
              <span className="hidden items-center gap-1 text-xs font-medium text-indigo-300 group-hover:text-white lg:inline-flex">{t("openSearch")}<ArrowUpRight className="h-3.5 w-3.5" /></span>
              <span className="mt-1 flex items-center gap-2 text-[11px] text-zinc-600 lg:hidden">{date} · {item.result_count} {t("resultsColumn").toLocaleLowerCase(locale)} <ArrowUpRight className="ml-auto h-4 w-4 text-indigo-300" /></span>
            </button>;
          })}
        </div>
      </div>}
    </section>}
  </AppPageShell>;
}
