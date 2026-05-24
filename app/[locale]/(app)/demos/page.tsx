"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, CopyCheck, ExternalLink, ArrowRight, Eye, Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";
import { CATEGORY_THEMES } from "@/lib/demo/categories";
import type { DemoBusinessData, DemoCategory } from "@/lib/demo/types";
import { AppPageShell } from "@/components/AppPageShell";
import { FeatureUnlockScreen } from "@/components/FeatureUnlockScreen";

interface Demo {
  id: string;
  slug: string;
  template: string;
  businessData: DemoBusinessData | Record<string, unknown>;
  viewsCount: number;
  createdAt: string;
}

function formatQuotaReset(periodEndIso: string, locale: string) {
  return new Date(periodEndIso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function getDemoDisplay(demo: Demo) {
  const raw = demo.businessData as Record<string, unknown>;
  const category = (demo.template in CATEGORY_THEMES
    ? demo.template
    : "general") as DemoCategory;
  const theme = CATEGORY_THEMES[category];
  const name = (raw.name as string) ?? "Sin nombre";
  const heroSubtitle =
    (raw.heroSubtitle as string) ??
    (raw.city as string) ??
    (raw.address as string) ??
    "";
  const heroImage = (raw.heroImage as string) ?? null;
  return { name, heroSubtitle, heroImage, theme };
}

export default function DemosPage() {
  const t = useTranslations("demosPage");
  const locale = useLocale();
  const { plan, demoQuota, refreshDemoQuota } = useSidebar();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (plan === "free") {
      setLoading(false);
      return;
    }
    fetch("/api/demos")
      .then((r) => r.json())
      .then((d) => {
        setDemos(d.demos ?? []);
        refreshDemoQuota();
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [plan, refreshDemoQuota]);

  const copyLink = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/demo/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (plan === "free") {
    return <FeatureUnlockScreen feature="demos" />;
  }

  const resetLabel =
    demoQuota?.periodEnd
      ? formatQuotaReset(demoQuota.periodEnd, locale)
      : null;

  const quotaLine =
    demoQuota && demoQuota.limit > 0
      ? t("quotaMonthly", { used: demoQuota.used, limit: demoQuota.limit })
      : demoQuota?.limit === -1
        ? t("quotaUnlimited")
        : null;

  const atLimit = demoQuota && demoQuota.limit > 0 && !demoQuota.canCreate;

  return (
    <AppPageShell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 mb-6 flex-wrap"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-[1.75rem] font-bold text-white tracking-tight">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
          {quotaLine ? (
            <p className="text-xs font-semibold text-violet-300/90 mt-2 tabular-nums">
              {quotaLine}
              {resetLabel ? (
                <span className="text-slate-600 font-normal">
                  {" "}
                  · {t("quotaReset", { date: resetLabel })}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        {atLimit ? (
          <span className="inline-flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl shrink-0 bg-zinc-800 text-zinc-500 cursor-not-allowed">
            <Sparkles className="w-3.5 h-3.5" />
            {t("createCta")}
          </span>
        ) : (
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.35)] shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("createCta")}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </motion.div>

      <div className="mb-6 flex gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-3.5 py-3 text-xs text-amber-200/90 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-amber-400/80 mt-0.5" />
        <p>{t("noDeleteNote")}</p>
      </div>

      {atLimit && demoQuota ? (
        <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-4 py-3">
          <p className="text-sm font-semibold text-violet-200">{t("limitReachedTitle")}</p>
          <p className="text-xs text-violet-300/70 mt-1 leading-relaxed">
            {t("limitReachedBody", {
              limit: demoQuota.limit,
              date: resetLabel ?? "",
            })}
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-neutral-800/70 bg-neutral-900/35 animate-pulse"
            />
          ))}
        </div>
      ) : demos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-neutral-800/70 bg-neutral-900/35 backdrop-blur-xl"
        >
          <div className="w-14 h-14 mb-4 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-base font-semibold text-slate-200 mb-1">{t("emptyTitle")}</p>
          <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">{t("emptyDesc")}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/25 text-violet-300 font-semibold text-sm rounded-xl transition-all"
          >
            {t("emptyCta")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {demos.map((demo, i) => {
              const { name, heroSubtitle, heroImage, theme } = getDemoDisplay(demo);
              const isCopied = copiedSlug === demo.slug;
              return (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="rounded-2xl border border-neutral-800/70 bg-neutral-900/35 backdrop-blur-xl hover:border-violet-500/25 overflow-hidden transition-all group"
                >
                  <div className="flex items-stretch gap-0">
                    <div
                      className={`w-24 sm:w-28 shrink-0 relative bg-gradient-to-br ${theme.heroGradient}`}
                    >
                      {heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={heroImage}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-2xl">
                          {theme.emoji}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-900/90" />
                    </div>

                    <div className="flex-1 min-w-0 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white line-clamp-1">{name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {heroSubtitle}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">{theme.label}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-slate-600 shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-xs tabular-nums">{demo.viewsCount}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyLink(demo.slug)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 text-violet-300 text-xs font-semibold rounded-lg transition-all"
                        >
                          {isCopied ? (
                            <CopyCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {isCopied ? t("copied") : t("copyLink")}
                        </button>
                        <a
                          href={`/demo/${demo.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/60 hover:bg-neutral-700 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t("preview")}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </AppPageShell>
  );
}
