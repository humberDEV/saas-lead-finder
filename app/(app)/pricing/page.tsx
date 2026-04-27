"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "../SidebarContext";

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes",
    desc: "Para probar Huntly y encontrar tus primeros leads.",
    features: [
      { text: "3 búsquedas gratis", ok: true },
      { text: "Score de oportunidad en cada lead", ok: true },
      { text: "WhatsApp y llamada directa", ok: true },
      { text: "Ver en Google Maps", ok: true },
      { text: "Sin tarjeta", ok: true },
      { text: "Guardar leads en cartera", ok: false },
      { text: "Historial de búsquedas", ok: false },
    ],
    cta: "Plan actual",
    planKey: "free",
    popular: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "/mes",
    desc: "Para freelancers que quieren buscar oportunidades cada semana.",
    features: [
      { text: "120 búsquedas/mes", ok: true },
      { text: "Score de oportunidad en cada lead", ok: true },
      { text: "WhatsApp y llamada directa", ok: true },
      { text: "Guardar leads en cartera", ok: true },
      { text: "Historial de búsquedas", ok: true },
      { text: "Soporte por email", ok: true },
    ],
    cta: "Contratar Starter",
    planKey: "starter",
    popular: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/mes",
    desc: "Para agencias o equipos que hacen prospección de forma constante.",
    features: [
      { text: "400 búsquedas/mes", ok: true },
      { text: "Todo lo de Starter", ok: true },
      { text: "Soporte prioritario", ok: true },
      { text: "Acceso beta a nuevas funciones", ok: true },
      { text: "Pensado para alto volumen", ok: true },
    ],
    cta: "Contratar Agency",
    planKey: "pro",
    popular: false,
  },
];

export default function Pricing() {
  const { plan: currentPlan, credits: remaining } = useSidebar();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

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
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-3">Precios</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Sin permanencia.<span className="text-indigo-400"> Cancela cuando quieras.</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Un cliente web puede valer mucho más que un mes de Huntly.
          </p>
          {remaining !== null && (
            <div className="inline-flex items-center gap-2 mt-5 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-sm">
              <span className="text-indigo-300 font-medium">Plan actual:</span>
              <span className="text-white font-bold capitalize">{currentPlan}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300">{remaining} búsquedas restantes este mes</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-start">
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
                    Más popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Tu plan
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-zinc-400">{plan.desc}</p>
                </div>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                  <span className="text-zinc-400 text-sm">{plan.period}</span>
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
                    Plan activo
                  </Link>
                ) : plan.planKey === "free" ? (
                  <Link
                    href="/dashboard"
                    className="block text-center w-full py-2.5 rounded-xl text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08] transition-colors"
                  >
                    Ir al dashboard
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
          ¿Dudas? Escríbenos a{" "}
          <a href="mailto:hola@huntly.app" className="text-zinc-400 hover:text-white transition-colors">
            hola@huntly.app
          </a>
        </p>
      </main>
    </div>
  );
}
