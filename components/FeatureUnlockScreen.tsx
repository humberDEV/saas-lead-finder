"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLANS } from "@/lib/plans";
import { AppPageShell } from "./AppPageShell";

export type GatedFeature = "crm" | "history" | "demos";

const FEATURE_ICONS = {
  crm: Briefcase,
  history: Clock,
  demos: Sparkles,
} as const;

function PreviewMock({ feature }: { feature: GatedFeature }) {
  if (feature === "crm") {
    return (
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {["En lista", "Contactado", "Cerrado"].map((col) => (
            <div key={col} className="rounded-lg bg-black/30 border border-neutral-800/80 p-2">
              <p className="text-[9px] font-semibold text-slate-500 mb-2 truncate">{col}</p>
              <div className="space-y-1.5">
                <div className="h-8 rounded-md bg-neutral-800/80 border border-neutral-700/50" />
                <div className="h-8 rounded-md bg-neutral-800/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (feature === "history") {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-neutral-800/80"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-neutral-700/80" />
              <div className="h-1.5 w-1/2 rounded bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="rounded-xl bg-black/30 border border-violet-500/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-lg flex items-center justify-center">✦</div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-neutral-700/80" />
            <div className="h-1.5 w-1/3 rounded bg-neutral-800" />
          </div>
        </div>
        <div className="h-20 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/15" />
      </div>
    </div>
  );
}

export function FeatureUnlockScreen({ feature }: { feature: GatedFeature }) {
  const t = useTranslations("featureGate");
  const tf = useTranslations(`featureGate.${feature}`);
  const Icon = FEATURE_ICONS[feature];
  const goPrice = PLANS.go.priceMonthly;

  const benefits = [tf("benefit1"), tf("benefit2"), tf("benefit3")] as const;

  return (
    <AppPageShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-neutral-900/45 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.1)] max-w-4xl"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

        <div className="grid md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug pt-1">
                {tf("title")}
              </h1>
            </div>

            <ul className="space-y-2 mb-6">
              {benefits.map((line) => (
                <li key={line} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <p className="text-base md:text-lg font-semibold text-amber-200/95 mb-1 leading-snug">
              {t("priceAnchor")}
            </p>
            <p className="text-xs text-slate-600 mb-5">{t("priceFrom", { price: `$${goPrice}` })}</p>

            <div className="flex flex-col gap-2">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-black hover:bg-slate-200 font-bold text-sm rounded-xl transition-all shadow-[0_0_24px_rgba(255,255,255,0.1)]"
              >
                {tf("ctaPrimary")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 hover:text-indigo-300 transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block border-l border-neutral-800/60 bg-black/20 min-h-[220px]">
            <div className="absolute inset-0 bg-gradient-to-l from-neutral-900/80 to-transparent z-10 pointer-events-none" />
            <div className="opacity-55 select-none pointer-events-none pt-4">
              <PreviewMock feature={feature} />
            </div>
          </div>
        </div>
      </motion.div>
    </AppPageShell>
  );
}
