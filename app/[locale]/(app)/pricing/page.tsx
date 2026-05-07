"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";

export default function Pricing() {
  const t = useTranslations("pricing");
  const tPlans = useTranslations("plans");
  const { plan: currentPlan, credits: remaining } = useSidebar();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Track paywall_viewed
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

  async function handleCheckout(planKey: string) {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
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
    <div className="h-full overflow-y-auto bg-[#0d0d14] text-white antialiased">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-3">{t("label")}</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {t("title")}<span className="text-indigo-400">{t("titleHighlight")}</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            {t("subtitle")}
          </p>
          {remaining !== null && (
            <div className="inline-flex items-center gap-2 mt-5 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-sm">
              <span className="text-indigo-300 font-medium">{t("currentPlan")}</span>
              <span className="text-white font-bold capitalize">{currentPlan}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300">{t("searchesRemaining", { count: remaining })}</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-start max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.planKey;
            const isLoading = loadingPlan === plan.planKey;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border flex flex-col p-6 ${
                  plan.popular
                    ? "border-indigo-500/35 bg-indigo-950/15 shadow-[0_0_48px_rgba(99,102,241,0.07)]"
                    : "border-white/[0.07] bg-white/[0.015]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-5 bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {t("mostPopular")}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {t("yourPlan")}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-zinc-400">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  {"originalPrice" in plan && plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-zinc-600 line-through">{plan.originalPrice}</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        -{Math.round((1 - parseInt(plan.price.replace("$","")) / parseInt((plan.originalPrice as string).replace("$",""))) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                    <span className="text-zinc-400 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      {feat.ok ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" />
                      )}
                      <span className={feat.ok ? "text-zinc-300" : "text-zinc-700"}>{feat.text}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-2.5 rounded-xl text-sm font-semibold bg-white/[0.06] text-zinc-400 border border-white/[0.08] cursor-default"
                  >
                    {t("activePlan")}
                  </Link>
                ) : plan.planKey === "free" ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-2.5 rounded-xl text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08] transition-colors"
                  >
                    {t("goToDashboard")}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey)}
                    disabled={!!loadingPlan}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      plan.popular
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          {t("contactUs")}{" "}
          <a href="mailto:hola@huntly.app" className="text-zinc-400 hover:text-white transition-colors">
            hola@huntly.app
          </a>
        </p>
      </main>
    </div>
  );
}
