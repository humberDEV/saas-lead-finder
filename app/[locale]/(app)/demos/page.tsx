"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Copy, CopyCheck, Eye, Info, Plus, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";
import { CATEGORY_THEMES } from "@/lib/demo/categories";
import type { DemoCategory } from "@/lib/demo/types";
import { AppPageShell } from "@/components/AppPageShell";
import { FeatureUnlockScreen } from "@/components/FeatureUnlockScreen";

interface Demo {
  id: string;
  slug: string;
  template: string;
  businessData: Record<string, unknown>;
  viewsCount: number;
  createdAt: string;
}

function displayDemo(demo: Demo) {
  const data = demo.businessData ?? {};
  const category = (demo.template in CATEGORY_THEMES ? demo.template : "general") as DemoCategory;
  return {
    name: typeof data.name === "string" ? data.name : demo.slug,
    subtitle: [data.city, data.address, data.heroSubtitle].find((value) => typeof value === "string" && value.trim()) as string | undefined,
    image: typeof data.heroImage === "string" ? data.heroImage : null,
    category: CATEGORY_THEMES[category].label,
  };
}

function DemoThumbnail({ name, image, locale }: { name: string; image: string | null; locale: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-700 bg-[#232d38] text-lg font-medium text-zinc-500">
    {image && !failed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
    ) : name.charAt(0).toLocaleUpperCase(locale)}
  </div>;
}

export default function DemosPage() {
  const t = useTranslations("demosPage");
  const locale = useLocale();
  const { plan, demoQuota, refreshDemoQuota } = useSidebar();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (plan === "free") {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch("/api/demos", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("load_failed"); return response.json(); })
      .then((data) => {
        setDemos(Array.isArray(data.demos) ? data.demos : []);
        setError(false);
        refreshDemoQuota();
      })
      .catch((reason) => { if (reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [plan, refreshDemoQuota]);

  const visibleDemos = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return [...demos]
      .filter((demo) => {
        if (!needle) return true;
        const display = displayDemo(demo);
        return [display.name, display.subtitle, display.category].some((value) => value?.toLocaleLowerCase(locale).includes(needle));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [demos, query, locale]);

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/demo/${slug}`);
      setCopiedSlug(slug);
      window.setTimeout(() => setCopiedSlug(null), 1800);
    } catch {
      setCopiedSlug(null);
    }
  };

  if (plan === "free") return <FeatureUnlockScreen feature="demos" />;

  const resetLabel = demoQuota?.periodEnd
    ? new Date(demoQuota.periodEnd).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { day: "numeric", month: "short", timeZone: "UTC" })
    : null;
  const hasLimitedQuota = !!demoQuota && demoQuota.limit > 0;
  const atLimit = hasLimitedQuota && !demoQuota.canCreate;
  const quotaPercent = hasLimitedQuota ? Math.min(100, (demoQuota.used / demoQuota.limit) * 100) : 0;

  return (
    <AppPageShell>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">Huntly / Demos</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
        {atLimit ? (
          <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-800 px-4 text-sm text-zinc-500" aria-disabled="true"><Plus className="h-4 w-4" />{t("createCta")}</span>
        ) : (
          <Link href="/search" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-700 bg-[#1e2225] px-4 text-sm font-medium text-zinc-100 hover:border-neutral-500"><Plus className="h-4 w-4" />{t("createCta")}</Link>
        )}
      </header>

      {demoQuota && (
        <section className="mb-6 rounded-lg border border-neutral-800 bg-[#141719] px-4 py-3" aria-label={t("quotaHeading")}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-zinc-200">{t("quotaHeading")}</p>
            <p className="font-mono text-xs tabular-nums text-zinc-400">{hasLimitedQuota ? t("quotaMonthly", { used: demoQuota.used, limit: demoQuota.limit }) : t("quotaUnlimited")}</p>
          </div>
          {hasLimitedQuota && <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-800" role="progressbar" aria-valuenow={demoQuota.used} aria-valuemin={0} aria-valuemax={demoQuota.limit} aria-label={t("quotaHeading")}><div className="h-full rounded-full bg-indigo-400" style={{ width: `${quotaPercent}%` }} /></div>}
          {hasLimitedQuota && <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-zinc-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /><p>{atLimit && resetLabel ? t("limitReachedBody", { limit: demoQuota.limit, date: resetLabel }) : resetLabel ? `${t("quotaReset", { date: resetLabel })}. ${t("noDeleteNote")}` : t("noDeleteNote")}</p></div>}
        </section>
      )}

      {loading ? (
        <div className="space-y-2" aria-label={t("loading")}>
          {[0, 1, 2].map((index) => <div key={index} className="h-[88px] animate-pulse rounded-md border border-neutral-800 bg-[#141719]" />)}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-neutral-800 bg-[#141719] px-5 py-12 text-center text-sm text-zinc-400">{t("loadError")}</div>
      ) : demos.length === 0 ? (
        <section className="rounded-lg border border-neutral-800 bg-[#141719] px-6 py-12">
          <h2 className="text-lg font-semibold text-white">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{t("emptyDesc")}</p>
          <Link href="/search" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400"><Plus className="h-4 w-4" />{t("emptyCta")}</Link>
        </section>
      ) : (
        <section aria-label={t("title")}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">{t("resultsCount", { count: visibleDemos.length })}</p>
            {demos.length > 4 && <label className="relative block w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><span className="sr-only">{t("searchPlaceholder")}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="h-10 w-full rounded-md border border-neutral-800 bg-[#1b1f22] pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-400 focus:outline-none" /></label>}
          </div>
          {visibleDemos.length === 0 ? <div className="rounded-lg border border-neutral-800 bg-[#141719] px-5 py-12 text-center text-sm text-zinc-500">{t("noMatches")}</div> : <div className="overflow-hidden rounded-lg border border-neutral-800 bg-[#141719]">
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_90px_205px] gap-4 border-b border-neutral-800 bg-[#1b1f22] px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-zinc-500 lg:grid"><span>{t("businessColumn")}</span><span>{t("createdColumn")}</span><span>{t("viewsColumn")}</span><span className="sr-only">{t("actionsColumn")}</span></div>
            <div className="divide-y divide-neutral-800">
              {visibleDemos.map((demo) => {
                const display = displayDemo(demo);
                const date = new Date(demo.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { day: "numeric", month: "short", year: "numeric" });
                const copied = copiedSlug === demo.slug;
                return <article key={demo.id} className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025] lg:grid lg:grid-cols-[minmax(0,1fr)_100px_90px_205px] lg:items-center lg:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <DemoThumbnail name={display.name} image={display.image} locale={locale} />
                    <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-zinc-100">{display.name}</h2><p className="mt-0.5 truncate text-xs text-zinc-500">{display.subtitle || display.category}</p><p className="mt-1 text-[11px] text-zinc-600">{display.category}</p></div>
                  </div>
                  <div className="hidden text-xs text-zinc-400 lg:block">{date}</div>
                  <div className="hidden items-center gap-1.5 text-xs tabular-nums text-zinc-400 lg:flex"><Eye className="h-3.5 w-3.5 text-zinc-600" />{demo.viewsCount}</div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span className="mr-auto text-[11px] text-zinc-600 lg:hidden">{date} · {demo.viewsCount} {t("viewsColumn").toLocaleLowerCase(locale)}</span>
                    <button type="button" onClick={() => copyLink(demo.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 hover:border-neutral-500 lg:min-h-9"><span>{copied ? <CopyCheck className="h-3.5 w-3.5 text-indigo-300" /> : <Copy className="h-3.5 w-3.5" />}</span>{copied ? t("copied") : t("copyLink")}</button>
                    <a href={`/demo/${demo.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 hover:border-neutral-500 lg:min-h-9"><ArrowUpRight className="h-3.5 w-3.5" />{t("preview")}</a>
                  </div>
                </article>;
              })}
            </div>
          </div>}
        </section>
      )}
    </AppPageShell>
  );
}
