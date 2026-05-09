import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle, Sparkles, ArrowUpRight,
} from "lucide-react";
import CursorGlow from "./CursorGlow";
import Reveal from "./Reveal";
import GlobeMap from "./GlobeMap";

const TICKER_ITEMS = [
  { name: "Barbería El Rincón", city: "Madrid", rating: "4.8" },
  { name: "Clínica Dental Arco", city: "Valencia", rating: "4.6" },
  { name: "Taller Mecánico Castro", city: "Barcelona", rating: "4.3" },
  { name: "Peluquería Avant", city: "Sevilla", rating: "4.9" },
  { name: "Reformas González", city: "Bilbao", rating: "4.5" },
  { name: "Fisio Centro Norte", city: "Zaragoza", rating: "4.7" },
  { name: "Estética Luna", city: "Málaga", rating: "4.8" },
  { name: "CrossFit Zona Sur", city: "Murcia", rating: "4.4" },
  { name: "Gestoría Pérez", city: "Alicante", rating: "4.5" },
  { name: "Óptica Central", city: "Granada", rating: "4.7" },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const t = await getTranslations("landing");
  const tPlans = await getTranslations("plans");
  const tFaqs = await getTranslations();

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
      cta: tPlans("free.cta"),
      popular: false,
    },
    {
      name: tPlans("go.name"),
      price: "$9",
      period: "/mes",
      desc: tPlans("go.desc"),
      features: (tPlans.raw("go.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("go.cta"),
      popular: true,
      checkoutKey: "go",
    },
    {
      name: tPlans("pro.name"),
      price: "$19",
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      popular: false,
      checkoutKey: "pro",
    },
  ];

  const FAQS = tFaqs.raw("faqs") as Array<{ q: string; a: string }>;
  void FAQS; // unused now

  return (
    <div className="min-h-screen text-white antialiased" style={{ background: "#050508" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Huntly",
            applicationCategory: "BusinessApplication",
            offers: { "@type": "AggregateOffer", lowPrice: "0", highPrice: "19", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Grain overlay */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.028]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: "repeat", backgroundSize: "180px" }}
      />

      <CursorGlow />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md border-b border-white/[0.05]" style={{ background: "rgba(5,5,8,0.88)" }}>
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-bold tracking-tight">
                Hunt<span className="text-indigo-500">ly</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors hidden sm:block">
                    {t("nav.signIn")}
                  </button>
                </SignInButton>
                <SignInButton mode="modal" forceRedirectUrl="/checkout/go">
                  <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    Comprar ahora
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        {/* ── TICKER — fixed below nav ── */}
        <div
          className="fixed top-14 inset-x-0 z-40 border-b border-white/[0.05] py-2.5 overflow-hidden"
          style={{ background: "rgba(5,5,8,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex animate-marquee whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 mx-8 shrink-0">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Sin web
                </span>
                <span className="text-xs font-medium text-zinc-400">{item.name}</span>
                <span className="text-zinc-800">·</span>
                <span className="text-xs text-zinc-600">{item.city}</span>
                <span className="text-zinc-800">·</span>
                <span className="text-xs text-yellow-600 font-medium">★ {item.rating}</span>
              </span>
            ))}
          </div>
        </div>

        {/* pt-14 navbar + ~40px ticker */}
        <main className="pt-[96px]">

          {/* ── HERO — viewport minus a bit so B/A peeks below ── */}
          <section
            className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            style={{ minHeight: "calc(100svh - 96px - 60px)" }}
          >
            {/* Dot grid */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.15]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
              }}
            />
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 75% 50% at 50% 50%, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
            <div aria-hidden className="absolute top-0 left-0 w-72 h-72 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)" }} />
            <div aria-hidden className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

            <div className="relative z-10 flex flex-col items-center">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs text-zinc-500 tracking-wide">Prospección local automatizada</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1
                  className="font-black tracking-tighter leading-[0.92] text-white mb-7 max-w-4xl"
                  style={{ fontSize: "clamp(36px, 6.5vw, 88px)" }}
                >
                  {t("hero.title1")}
                  <br />
                  {t("hero.title2")}
                  <br />
                  <span className="bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                    {t("hero.title3")}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-base md:text-lg text-zinc-500 mb-12 max-w-sm leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex flex-col items-center gap-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(255,255,255,0.07)" }}
                      >
                        {t("hero.ctaPrimary")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all">
                      {t("hero.ctaDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-zinc-700">{t("hero.freeNote")}</span>
                </div>
              </Reveal>
            </div>

            {/* Scroll nudge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-auto" />
            </div>
          </section>

          {/* ── BEFORE / AFTER ── */}
          <section className="px-6 pt-8 pb-20 md:pb-28" style={{ background: "#070710" }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-8 text-center">
                  Sin Huntly · Con Huntly
                </p>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                <Reveal delay={0}>
                  <div className="rounded-2xl border border-red-500/10 p-1 h-full" style={{ background: "rgba(239,68,68,0.02)" }}>
                    <div className="rounded-xl border border-dashed border-red-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-red-500/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Proceso manual en Google Maps<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-red-900 text-center py-2.5 font-medium">Sin Huntly</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-2xl border border-emerald-500/10 p-1 h-full" style={{ background: "rgba(52,211,153,0.02)" }}>
                    <div className="rounded-xl border border-dashed border-emerald-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Dashboard con leads en segundos<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 text-center py-2.5 font-medium">Con Huntly</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PAIN ── */}
          <section
            className="relative px-6 py-20 md:py-32 overflow-hidden"
            style={{ background: "linear-gradient(to bottom, #070710, #0a040e, #070710)" }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(248,113,113,0.05) 0%, transparent 70%)" }} />

            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-14">
                  {t("problem.label")}
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h2
                  className="font-black tracking-tighter leading-[1.0] text-white mb-16 max-w-3xl"
                  style={{ fontSize: "clamp(24px, 4vw, 48px)" }}
                >
                  ¿Cuántas horas llevas<br />
                  <span className="text-zinc-600">buscando clientes en Google Maps?</span>
                </h2>
              </Reveal>

              <div className="space-y-5 md:space-y-7">
                <Reveal delay={0}><p className="font-black tracking-tighter leading-tight text-zinc-700" style={{ fontSize: "clamp(18px, 2.5vw, 30px)" }}>Otra vez abrir Maps.</p></Reveal>
                <Reveal delay={60}><p className="font-black tracking-tighter leading-tight text-zinc-600" style={{ fontSize: "clamp(21px, 3vw, 38px)" }}>Otra vez revisar si tienen web.</p></Reveal>
                <Reveal delay={120}><p className="font-black tracking-tighter leading-tight text-zinc-500" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>Otra vez copiar el teléfono.</p></Reveal>
                <Reveal delay={180}><p className="font-black tracking-tighter leading-tight text-zinc-400" style={{ fontSize: "clamp(27px, 4.2vw, 54px)" }}>Otra vez que no contesten.</p></Reveal>
                <Reveal delay={240}>
                  <p
                    className="font-black tracking-tighter leading-tight"
                    style={{ fontSize: "clamp(38px, 6vw, 76px)", color: "#f87171", textShadow: "0 0 80px rgba(248,113,113,0.22)" }}
                  >
                    Horas<br />sin facturar.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── STORYTELLING 1 — Deja de buscar a mano ── */}
          <section className="px-6 py-20 md:py-32" style={{ background: "#0c0c18" }}>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-6">Para qué sirve</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-6"
                    style={{ fontSize: "clamp(26px, 3.5vw, 48px)" }}
                  >
                    Deja de perder horas<br />
                    <span className="text-zinc-500">buscando clientes<br />a mano en Google Maps.</span>
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed max-w-xs">
                    Huntly escanea Google Maps por ti. Filtra los negocios sin web, extrae su teléfono y los puntúa para que solo contactes los que tienen oportunidad real.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                {/* Video placeholder */}
                <div
                  className="rounded-2xl border border-dashed border-white/[0.08] overflow-hidden"
                  style={{ aspectRatio: "16/10", background: "rgba(255,255,255,0.015)" }}
                >
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest text-center leading-relaxed">
                      Vídeo: búsqueda manual en Google Maps<br />aquí — 1280 × 800 recomendado
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── STORYTELLING 2 — Busca en cualquier país ── */}
          <section
            className="relative px-6 py-20 md:py-32 overflow-hidden"
            style={{ background: "#080810" }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 70% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
            <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-6">Cobertura global</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-6"
                    style={{ fontSize: "clamp(26px, 3.5vw, 48px)" }}
                  >
                    No te limites<br />
                    <span className="text-zinc-500">a tu ciudad.</span>
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed max-w-xs">
                    Huntly funciona en cualquier país hispanohablante del mundo. Busca clientes en Madrid, Ciudad de México, Buenos Aires o Bogotá con el mismo proceso, sin cambiar nada.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {["España", "México", "Argentina", "Colombia", "Perú", "Chile", "+más"].map((c) => (
                      <span key={c} className="text-[10px] font-mono text-zinc-600 bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-1 uppercase tracking-wide">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-2xl overflow-hidden border border-indigo-500/15" style={{ height: 380 }}>
                  <GlobeMap />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── DEMO ── */}
          <section id="demo" className="px-6 py-20 md:py-28" style={{ background: "#0d0d18" }}>
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-5">{t("demo.label")}</p>
                <h2 className="font-black tracking-tighter text-white mb-10" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div
                  className="rounded-2xl overflow-hidden border border-white/10 bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.6)" }}
                >
                  <video className="w-full bg-black brightness-110" autoPlay loop muted playsInline
                    src="https://res.cloudinary.com/dufnkxsfm/video/upload/v1777248069/minidemo_kzfinl.mp4"
                  />
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-10 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]">
                        {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]">
                      {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── SOCIAL PROOF ── */}
          <section className="px-6 py-20 md:py-28" style={{ background: "#07070e" }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-10 text-center">
                  Lo que dicen los usuarios
                </p>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div
                      className="rounded-2xl border border-dashed border-white/[0.07] p-6 h-full"
                      style={{ background: "rgba(255,255,255,0.015)" }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-2 w-20 bg-zinc-800 rounded-full" />
                          <div className="h-1.5 w-14 bg-zinc-900 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-2 bg-zinc-800/60 rounded-full" />
                        <div className="h-2 bg-zinc-800/60 rounded-full w-5/6" />
                        <div className="h-2 bg-zinc-800/60 rounded-full w-4/6" />
                      </div>
                      <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Testimonio real aquí</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precios" className="px-6 py-24 md:py-32" style={{ background: "#090912" }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-5">
                  {t("pricingSection.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-3"
                  style={{ fontSize: "clamp(26px, 4vw, 50px)" }}
                >
                  {t("pricingSection.title")}
                  <span className="text-indigo-400">{t("pricingSection.titleHighlight")}</span>
                </h2>
                <div className="flex items-start gap-2 mb-14 max-w-lg">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    <span className="text-zinc-300">{t("pricingSection.valueNote")}</span>{" "}
                    <span className="text-emerald-500">{t("pricingSection.valueHighlight")}</span>
                  </p>
                </div>
              </Reveal>

              {/* Pricing cards — full max-w-6xl, 3 columns */}
              <div className="grid md:grid-cols-3 gap-5">
                {PLANS.map((plan, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <div
                      className="relative rounded-3xl flex flex-col p-8 h-full"
                      style={{
                        background: plan.popular
                          ? "linear-gradient(160deg, rgba(99,102,241,0.14) 0%, rgba(10,10,20,1) 55%)"
                          : "rgba(255,255,255,0.025)",
                        boxShadow: plan.popular
                          ? "0 0 0 1px rgba(99,102,241,0.35), 0 0 80px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
                          : "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      {/* Top glow line on popular */}
                      {plan.popular && (
                        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(99,102,241,0.8), transparent)" }} />
                      )}

                      {/* Plan header */}
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t("pricingSection.mostPopular")}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className="font-black tracking-tight"
                            style={{
                              fontSize: "clamp(44px, 5vw, 60px)",
                              color: plan.popular ? "#fff" : "rgba(255,255,255,0.7)",
                            }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-zinc-600 text-sm">{plan.period}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{plan.desc}</p>
                      </div>

                      {/* Feature list */}
                      <ul className="space-y-3.5 mb-10 flex-1">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-3">
                            {feat.ok ? (
                              <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-indigo-400" : "text-emerald-600"}`} />
                            ) : (
                              <span className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center">
                                <span className="w-3 h-px bg-zinc-800 block" />
                              </span>
                            )}
                            <span className={`text-sm leading-snug ${feat.ok ? (plan.popular ? "text-zinc-200" : "text-zinc-400") : "text-zinc-700"}`}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <SignedOut>
                        {"checkoutKey" in plan && plan.checkoutKey ? (
                          <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                            <button
                              className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                plan.popular
                                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                                  : "bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08]"
                              }`}
                            >
                              {plan.cta}
                            </button>
                          </SignInButton>
                        ) : (
                          <SignInButton mode="modal">
                            <button
                              className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                plan.popular
                                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                                  : "bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08]"
                              }`}
                            >
                              {plan.cta}
                            </button>
                          </SignInButton>
                        )}
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                          className={`block text-center w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            plan.popular
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                              : "bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08]"
                          }`}
                        >
                          {plan.cta}
                        </Link>
                      </SignedIn>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section
            className="relative px-6 py-32 md:py-48 text-center overflow-hidden"
            style={{ background: "linear-gradient(to bottom, #0d0d18, #050508)" }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-10">Empieza ahora</p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-6"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-indigo-400">{t("finalCta.title2")}</span>
                </h2>
                <p className="text-zinc-600 text-base mb-12">{t("finalCta.subtitle")}</p>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex flex-col items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(255,255,255,0.06)" }}
                      >
                        {t("finalCta.ctaButton")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all">
                      {t("finalCta.ctaDashboard")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-zinc-700">{t("finalCta.freeNote")}</span>
                  <Link href="#precios" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors">
                    {t("finalCta.viewPlans")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="border-t border-white/[0.04] py-8 px-6" style={{ background: "#050508" }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <span className="text-sm font-semibold text-zinc-700">Huntly</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-700">
                <Link href="#demo" className="hover:text-zinc-400 transition-colors">{t("footer.howItWorks")}</Link>
                <Link href="#precios" className="hover:text-zinc-400 transition-colors">{t("footer.pricing")}</Link>
                <Link href="mailto:huntly@outlook.es" className="hover:text-zinc-400 transition-colors">{t("footer.contact")}</Link>
              </div>
              <p className="text-sm text-zinc-800">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
