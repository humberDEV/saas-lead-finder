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
      period: "/mes",
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
      period: "/mes",
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
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      planKey: "pro",
      popular: false,
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
          {remaining !== null && (
            <div className="inline-flex items-center gap-2 mt-5 border border-violet-500/20 px-4 py-2 rounded-full text-sm"
              style={{ background: "rgba(139,92,246,0.08)" }}>
              <span className="text-violet-300 font-medium">{t("currentPlan")}</span>
              <span className="text-white font-bold capitalize">{currentPlan}</span>
              <span className="text-violet-700">·</span>
              <span className="text-violet-200">{t("searchesRemaining", { count: remaining })}</span>
            </div>
          )}
        </div>

        {/* 20× value callout */}
        <div
          className="rounded-2xl border border-violet-500/20 p-5 mb-8 max-w-2xl"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                recuperas la inversión con tu primera venta web.
              </p>
              <p className="text-violet-200 text-xs leading-relaxed">
                Los usuarios de Huntly pagan <span className="text-violet-100">$9 al mes</span>. Una sola web vale 200€ o más. Cierra uno y el plan está pagado 20 veces.
              </p>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.planKey;
            const isLoading = loadingPlan === plan.planKey;

            return (
              <div
                key={plan.name}
                className={`group relative rounded-3xl flex flex-col p-6 h-full transition-all duration-200 ${
                  !plan.popular ? "hover:-translate-y-1" : ""
                }`}
                style={{
                  background: plan.popular
                    ? "linear-gradient(160deg, rgba(139,92,246,0.18) 0%, rgba(11,9,23,1) 55%)"
                    : "rgba(139,92,246,0.04)",
                  boxShadow: plan.popular
                    ? "0 0 0 1px rgba(139,92,246,0.40), 0 0 60px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 0 0 1px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                {/* Hover glow on non-popular */}
                {!plan.popular && (
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.28), 0 0 40px rgba(139,92,246,0.08)" }}
                  />
                )}

                {/* Top gradient line on popular */}
                {plan.popular && (
                  <div
                    className="absolute top-0 left-8 right-8 h-px"
                    style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.9), transparent)" }}
                  />
                )}

                {/* Card header */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="text-[10px] font-mono text-violet-300/90 uppercase tracking-widest">
                    {plan.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {plan.popular && (
                      <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {t("mostPopular")}
                      </span>
                    )}
                    {isCurrentPlan && (
                      <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {t("yourPlan")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {plan.planKey === "go" && flash.active ? (
                    <>
                      <p className="text-xs text-amber-400/80 italic mb-2">Oferta de bienvenida</p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className="font-black tracking-tight"
                          style={{ fontSize: "clamp(36px, 4vw, 52px)", color: "#fbbf24" }}
                        >
                          $4.50
                        </span>
                        <span className="text-amber-400/60 text-sm">/mes</span>
                        <span className="text-zinc-600 text-sm line-through">$9</span>
                      </div>
                      <p className="text-[11px] tabular-nums" style={{ color: "rgba(245,158,11,0.45)" }}>
                        expira en {flash.mm}:{flash.ss} · luego $9/mes
                      </p>
                    </>
                  ) : (
                    <>
                      {"originalPrice" in plan && plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm text-violet-600 line-through">{plan.originalPrice}</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded">
                            -{Math.round((1 - parseInt(plan.price.replace("$", "")) / parseInt((plan.originalPrice as string).replace("$", ""))) * 100)}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="font-black tracking-tight"
                          style={{
                            fontSize: "clamp(36px, 4vw, 52px)",
                            color: plan.popular ? "#fff" : "rgba(221,214,254,0.65)",
                          }}
                        >
                          {plan.price}
                        </span>
                        <span className="text-violet-400 text-sm">{plan.period}</span>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-violet-200 mt-1.5 leading-relaxed">{plan.desc}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      {feat.ok ? (
                        <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-emerald-500/80"}`} />
                      ) : (
                        <span className="w-3.5 h-3.5 shrink-0 mt-1.5 flex items-center">
                          <span className="w-2.5 h-px bg-violet-700/40 block" />
                        </span>
                      )}
                      <span className={`text-xs leading-snug ${feat.ok ? (plan.popular ? "text-white" : "text-violet-200") : "text-violet-600"}`}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-3 rounded-2xl text-sm font-bold transition-all bg-violet-500/[0.07] text-violet-500 border border-violet-500/15 cursor-default"
                  >
                    {t("activePlan")}
                  </Link>
                ) : plan.planKey === "free" ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-3 rounded-2xl text-sm font-bold transition-all bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
                  >
                    {t("goToDashboard")}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey, plan.planKey === "go" && flash.active)}
                    disabled={!!loadingPlan}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={
                      plan.planKey === "go" && flash.active
                        ? {
                            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                            color: "#0d0d14",
                            boxShadow: "0 0 24px rgba(245,158,11,0.35)",
                          }
                        : plan.popular
                        ? {
                            background: "#7c3aed",
                            color: "#fff",
                            boxShadow: "0 0 20px rgba(139,92,246,0.35)",
                          }
                        : {
                            background: "rgba(139,92,246,0.09)",
                            color: "rgba(221,214,254,0.9)",
                            border: "1px solid rgba(139,92,246,0.20)",
                          }
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : plan.planKey === "go" && flash.active ? (
                      <>Reclamar oferta · $4.50 primer mes <ArrowRight className="w-3.5 h-3.5" /></>
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
