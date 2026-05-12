"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";
import { useFlashOffer, FLASH_COUPON } from "@/hooks/useFlashOffer";

const BG = {
  base: "#0e0b1e",
  deep: "#0b0917",
  mid:  "#120f26",
  alt:  "#100d22",
};

export default function Pricing() {
  const t = useTranslations("pricing");
  const tPlans = useTranslations("plans");
  const period = t("period");
  const { plan: currentPlan, credits: remaining } = useSidebar();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const flash = useFlashOffer();

  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "paywall_viewed", properties: { source: "pricing_page" } }),
    }).catch(() => {});
  }, []);

  const PLANS = [
    {
      name: tPlans("free.name"),
      price: "$0",
      period,
      desc: tPlans("free.desc"),
      features: [
        ...((tPlans.raw("free.features") as string[]).map((text: string) => ({ text, ok: true }))),
        ...((tPlans.raw("free.disabledFeatures") as string[]).map((text: string) => ({ text, ok: false }))),
      ],
      cta: t("activePlan"),
      planKey: "free",
      popular: false,
    },
    {
      name: tPlans("go.name"),
      price: "$9",
      originalPrice: "$19",
      period,
      desc: tPlans("go.desc"),
      features: (tPlans.raw("go.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("go.cta"),
      planKey: "go",
      popular: true,
    },
    {
      name: tPlans("pro.name"),
      price: "$19",
      originalPrice: "$39",
      period,
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      planKey: "pro",
      popular: false,
      secondary: true,
    },
  ];

  async function handleCheckout(planKey: string, withFlash = false) {
    setLoadingPlan(planKey);
    try {
      const body: Record<string, string> = { planKey };
      if (withFlash) body.coupon = FLASH_COUPON;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error("Checkout error", err);
      setLoadingPlan(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto text-white antialiased" style={{ background: BG.deep }}>
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-20">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-3">
            {t("label")}
          </p>
          <h1
            className="font-black tracking-tighter text-white mb-3"
            style={{ fontSize: "clamp(26px, 3.5vw, 42px)" }}
          >
            {t("title")}
            <span className="text-violet-400">{t("titleHighlight")}</span>
          </h1>
          <p className="text-sm text-violet-200 max-w-md">
            {t("subtitle")}
          </p>
        </div>

        {/* 20× value callout */}
        <div
          className="rounded-2xl border border-violet-500/20 mb-8 max-w-2xl"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
        >
          {/* Mobile: compact horizontal strip */}
          <div className="flex md:hidden items-center gap-3 px-4 py-3">
            <span
              className="font-black text-transparent bg-clip-text shrink-0 leading-none"
              style={{ fontSize: 28, backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)" }}
            >
              20×
            </span>
            <p className="text-xs text-violet-200 leading-snug">
              {t("valueCalloutMobile")} <span className="text-violet-100 font-semibold">{t("valueCalloutMobileHighlight")}</span>.
            </p>
          </div>
          {/* Desktop: original layout */}
          <div className="hidden md:flex items-center gap-4 p-5">
            <div className="shrink-0 leading-none">
              <span
                className="font-black text-transparent bg-clip-text"
                style={{ fontSize: "clamp(40px, 5vw, 56px)", backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)" }}
              >
                20×
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-snug mb-1">
                {t("valueCalloutTitle")}
              </p>
              <p className="text-violet-200 text-xs leading-relaxed">
                {t("valueCalloutBody")}
              </p>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.planKey;
            const isLoading = loadingPlan === plan.planKey;
            const isFree = plan.planKey === "free";
            const k = plan.planKey as "free" | "go" | "pro";

            // ── Per-tier visual tokens ────────────────────────────────────────
            const card = {
              free: {
                bg:     "rgba(7,5,16,0.97)",
                shadow: "0 0 0 1px rgba(255,255,255,0.04)",
                hoverShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                topLine: null,
                nameColor: "text-zinc-600",
                priceColor: "rgba(113,113,122,0.65)",
                periodColor: "text-zinc-700",
                descColor: "text-zinc-600",
                checkColor: "text-zinc-700",
                featOk: "text-zinc-500",
                featNo: "text-zinc-700",
                dashColor: "bg-zinc-800",
              },
              go: {
                bg:     "linear-gradient(155deg, rgba(124,58,237,0.22) 0%, rgba(139,92,246,0.07) 50%, transparent 100%)",
                shadow: "0 0 0 1px rgba(139,92,246,0.55), 0 0 80px rgba(139,92,246,0.20), 0 0 28px rgba(124,58,237,0.14), inset 0 1px 0 rgba(255,255,255,0.08)",
                hoverShadow: "",
                topLine: "linear-gradient(to right, transparent, rgba(167,139,250,1), transparent)",
                nameColor: "text-violet-300",
                priceColor: "#ffffff",
                periodColor: "text-violet-300",
                descColor: "text-violet-200",
                checkColor: "text-violet-400",
                featOk: "text-white",
                featNo: "",
                dashColor: "",
              },
              pro: {
                bg:     "linear-gradient(155deg, rgba(22,18,50,0.97) 0%, rgba(10,8,24,0.99) 100%)",
                shadow: "0 0 0 1px rgba(148,163,184,0.11), 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
                hoverShadow: "0 0 0 1px rgba(148,163,184,0.18), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
                topLine: "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)",
                nameColor: "text-slate-400",
                priceColor: "rgba(255,255,255,0.92)",
                periodColor: "text-slate-500",
                descColor: "text-slate-400",
                checkColor: "text-violet-400/60",
                featOk: "text-zinc-200",
                featNo: "",
                dashColor: "",
              },
            }[k];

            return (
              <div
                key={plan.name}
                className={`group relative rounded-3xl flex flex-col p-6 h-full transition-all duration-200 hover:-translate-y-0.5 ${isFree ? "hidden md:flex" : "flex"}`}
                style={{ background: card.bg, boxShadow: card.shadow }}
              >
                {/* Hover shadow swap (free + pro only) */}
                {k !== "go" && (
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ boxShadow: card.hoverShadow }}
                  />
                )}

                {/* Decorative top line */}
                {card.topLine && (
                  <div
                    className="absolute top-0 left-8 right-8 h-px"
                    style={{ background: card.topLine }}
                  />
                )}

                {/* Card header */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${card.nameColor}`}>
                    {plan.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {k === "go" && (
                      <span className="text-[10px] font-bold text-violet-200 bg-violet-500/20 border border-violet-400/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {t("mostPopular")}
                      </span>
                    )}
                    {k === "pro" && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {t("agencies")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {k === "go" && flash.active ? (
                    <>
                      <p className="text-xs text-amber-400/80 italic mb-2">{t("flashTitle")}</p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-black tracking-tight" style={{ fontSize: "clamp(36px, 4vw, 52px)", color: "#fbbf24" }}>
                          $4.50
                        </span>
                        <span className="text-amber-400/60 text-sm">{period}</span>
                        <span className="text-zinc-600 text-sm line-through">$9</span>
                      </div>
                      <p className="text-xs italic mt-0.5" style={{ color: "rgba(245,158,11,0.45)" }}>{t("flashExpires")}</p>
                      <p className="text-3xl font-black tabular-nums leading-none" style={{ color: "rgba(245,158,11,0.9)" }}>
                        {flash.mm}:{flash.ss}
                      </p>
                      <p className="text-[11px] tabular-nums" style={{ color: "rgba(245,158,11,0.35)" }}>{t("flashThen")}</p>
                    </>
                  ) : (
                    <>
                      {"originalPrice" in plan && plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-sm line-through ${k === "free" ? "text-zinc-700" : "text-violet-600"}`}>
                            {plan.originalPrice}
                          </span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded">
                            -{Math.round((1 - parseInt(plan.price.replace("$", "")) / parseInt((plan.originalPrice as string).replace("$", ""))) * 100)}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="font-black tracking-tight"
                          style={{ fontSize: "clamp(36px, 4vw, 52px)", color: card.priceColor }}
                        >
                          {plan.price}
                        </span>
                        <span className={`text-sm ${card.periodColor}`}>{plan.period}</span>
                      </div>
                    </>
                  )}
                  <p className={`text-xs mt-1.5 leading-relaxed ${card.descColor}`}>{plan.desc}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      {feat.ok ? (
                        <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${card.checkColor}`} />
                      ) : (
                        <span className="w-3.5 h-3.5 shrink-0 mt-1.5 flex items-center">
                          <span className={`w-2.5 h-px block ${card.dashColor}`} />
                        </span>
                      )}
                      <span className={`text-xs leading-snug ${feat.ok ? card.featOk : card.featNo || "text-zinc-700"}`}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-3 rounded-2xl text-sm font-bold bg-white/[0.04] text-zinc-500 border border-white/[0.06] cursor-default"
                  >
                    {t("activePlan")}
                  </Link>
                ) : k === "free" ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-3 rounded-2xl text-sm font-semibold transition-all text-zinc-600 border border-white/[0.05] hover:border-white/[0.10] hover:text-zinc-400"
                  >
                    {t("goToDashboard")}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(k, k === "go" && flash.active)}
                    disabled={!!loadingPlan}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={
                      k === "go" && flash.active
                        ? {
                            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                            color: "#0d0d14",
                            boxShadow: "0 0 24px rgba(245,158,11,0.35)",
                          }
                        : k === "go"
                        ? {
                            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                            color: "#fff",
                            boxShadow: "0 0 28px rgba(139,92,246,0.50)",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(226,232,240,0.85)",
                            border: "1px solid rgba(148,163,184,0.14)",
                          }
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : k === "go" && flash.active ? (
                      <>{t("flashCta")} <ArrowRight className="w-3.5 h-3.5" /></>
                    ) : (
                      <>{plan.cta} <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-violet-600 mt-8">
          {t("contactUs")}{" "}
          <a href="mailto:huntly@outlook.es" className="text-violet-400 hover:text-violet-200 transition-colors">
            huntly@outlook.es
          </a>
        </p>

      </main>
    </div>
  );
}
