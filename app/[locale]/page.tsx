import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle, MapPin, Sparkles, ArrowUpRight, Phone,
} from "lucide-react";
import CursorGlow from "./CursorGlow";
import Reveal from "./Reveal";

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
      originalPrice: "$19",
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
      originalPrice: "$39",
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      popular: false,
      checkoutKey: "pro",
    },
  ];

  const FAQS = tFaqs.raw("faqs") as Array<{ q: string; a: string }>;

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

      {/* Cursor glow — client island */}
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
            <div className="flex items-center gap-5">
              <Link href="#demo" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors hidden md:block">
                {t("nav.howItWorks")}
              </Link>
              <Link href="#precios" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors hidden md:block">
                {t("nav.pricing")}
              </Link>
              <SignedOut>
                <div className="flex items-center gap-3">
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
                </div>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        <main className="pt-14">

          {/* ── HERO — full viewport, centered, pure typography ── */}
          <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">

            {/* Dot grid */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.18]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
              }}
            />

            {/* Centered radial glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 75% 50% at 50% 50%, rgba(99,102,241,0.11) 0%, transparent 70%)",
              }}
            />

            {/* Corner ambient glows */}
            <div aria-hidden className="absolute top-0 left-0 w-72 h-72 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)" }} />
            <div aria-hidden className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

            <div className="relative z-10 flex flex-col items-center">
              {/* Live pill */}
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs text-zinc-500 tracking-wide">Prospección inteligente</span>
                </div>
              </Reveal>

              {/* Headline */}
              <Reveal delay={80}>
                <h1
                  className="font-black tracking-tighter leading-[0.92] text-white mb-7 max-w-5xl"
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

              {/* Subtitle */}
              <Reveal delay={160}>
                <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-sm leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </Reveal>

              {/* CTA */}
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
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all"
                    >
                      {t("hero.ctaDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-zinc-700">{t("hero.freeNote")}</span>
                </div>
              </Reveal>
            </div>

            {/* Scroll nudge */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-20">
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-zinc-500 to-transparent" />
            </div>
          </section>

          {/* ── TICKER ── */}
          <div className="border-y border-white/[0.05] py-3.5 overflow-hidden" style={{ background: "#060609" }}>
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

          {/* ── BEFORE / AFTER — placeholder para imágenes reales ── */}
          <section className="px-6 py-20 md:py-28" style={{ background: "#070710" }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-10 text-center">
                  Sin Huntly · Con Huntly
                </p>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                <Reveal delay={0}>
                  <div className="rounded-2xl border border-red-500/10 p-1 h-full" style={{ background: "rgba(239,68,68,0.02)" }}>
                    <div className="rounded-xl border border-dashed border-red-500/15 h-60 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-red-500/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br/>Proceso manual en Google Maps
                      </span>
                      <div className="w-10 h-px bg-red-500/10" />
                      <span className="text-xs text-zinc-800 text-center">Recomendado: 800 × 480</span>
                    </div>
                    <p className="text-xs text-red-900 text-center py-2.5 font-medium">Sin Huntly</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-2xl border border-emerald-500/10 p-1 h-full" style={{ background: "rgba(52,211,153,0.02)" }}>
                    <div className="rounded-xl border border-dashed border-emerald-500/15 h-60 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br/>Dashboard con leads en segundos
                      </span>
                      <div className="w-10 h-px bg-emerald-500/10" />
                      <span className="text-xs text-zinc-800 text-center">Recomendado: 800 × 480</span>
                    </div>
                    <p className="text-xs text-emerald-900 text-center py-2.5 font-medium">Con Huntly</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PAIN — escalating typography, subtle red ambient ── */}
          <section
            className="relative px-6 py-32 md:py-48 overflow-hidden"
            style={{ background: "linear-gradient(to bottom, #070710, #0a040e, #070710)" }}
          >
            {/* Red ambient glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(248,113,113,0.05) 0%, transparent 70%)" }}
            />

            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-20">
                  {t("problem.label")}
                </p>
              </Reveal>

              <Reveal delay={60}>
                <h2
                  className="font-black tracking-tighter leading-[1.0] text-white mb-24 max-w-3xl"
                  style={{ fontSize: "clamp(26px, 4.5vw, 52px)" }}
                >
                  ¿Cuántas horas llevas<br />
                  <span className="text-zinc-600">buscando clientes en Google Maps?</span>
                </h2>
              </Reveal>

              <div className="space-y-6 md:space-y-9">
                <Reveal delay={0}>
                  <p className="font-black tracking-tighter leading-tight text-zinc-700" style={{ fontSize: "clamp(18px, 2.5vw, 30px)" }}>
                    Otra vez abrir Maps.
                  </p>
                </Reveal>
                <Reveal delay={60}>
                  <p className="font-black tracking-tighter leading-tight text-zinc-600" style={{ fontSize: "clamp(21px, 3vw, 38px)" }}>
                    Otra vez revisar si tienen web.
                  </p>
                </Reveal>
                <Reveal delay={120}>
                  <p className="font-black tracking-tighter leading-tight text-zinc-500" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>
                    Otra vez copiar el teléfono.
                  </p>
                </Reveal>
                <Reveal delay={180}>
                  <p className="font-black tracking-tighter leading-tight text-zinc-400" style={{ fontSize: "clamp(27px, 4.2vw, 54px)" }}>
                    Otra vez que no contesten.
                  </p>
                </Reveal>
                <Reveal delay={240}>
                  <p
                    className="font-black tracking-tighter leading-tight"
                    style={{
                      fontSize: "clamp(38px, 6vw, 76px)",
                      color: "#f87171",
                      textShadow: "0 0 80px rgba(248,113,113,0.22)",
                    }}
                  >
                    Horas<br />sin facturar.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PIVOT — short, direct, contrast ── */}
          <section className="relative px-6 py-24 md:py-36 overflow-hidden" style={{ background: "#0c0c18" }}>
            {/* Indigo ambient */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 50% 50% at 80% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-5xl mx-auto">
              <Reveal>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white"
                  style={{ fontSize: "clamp(32px, 5.5vw, 76px)" }}
                >
                  Huntly rastrea<br />
                  Google Maps<br />
                  <span className="text-indigo-400">por ti.</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-zinc-500 text-lg mt-8 max-w-xs leading-relaxed">
                  Escribe el nicho.<br />
                  Elige la ciudad.<br />
                  Huntly hace el resto.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── LEAD MOMENT ── */}
          <section
            className="px-6 py-32 md:py-48"
            style={{ background: "linear-gradient(to bottom, #040e07, #07120a, #040e07)" }}
          >
            <div className="max-w-2xl mx-auto">
              <Reveal>
                <div className="flex items-center gap-2 mb-16">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">
                    Oportunidad detectada
                  </span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div
                  className="rounded-3xl border border-emerald-500/20 p-8 md:p-10 mb-8"
                  style={{
                    background: "linear-gradient(150deg, #0c1a10 0%, #08110b 100%)",
                    boxShadow: "0 0 140px rgba(52,211,153,0.07), 0 0 0 1px rgba(52,211,153,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <h3
                        className="font-black text-white tracking-tight mb-2"
                        style={{ fontSize: "clamp(20px, 2.5vw, 28px)" }}
                      >
                        Barbería El Rincón
                      </h3>
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm">Calle Mayor 14, Madrid</span>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                      style={{ boxShadow: "0 0 16px rgba(52,211,153,0.2)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SIN WEB
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-white/[0.06]">
                    <div>
                      <span className="text-yellow-400 text-xl font-bold">★ 4.8</span>
                      <span className="text-zinc-600 text-sm ml-2">· 247 reseñas</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Phone className="w-4 h-4" />
                      <span className="font-mono text-sm">+34 612 345 678</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-zinc-600 font-medium uppercase tracking-wide">Alta probabilidad</span>
                      <span className="text-sm font-black text-emerald-400">95 / 100</span>
                    </div>
                    <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400"
                        style={{ width: "95%" }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold py-3.5 rounded-xl transition-colors">
                      Enviar WhatsApp
                    </button>
                    <button className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white text-sm py-3.5 rounded-xl transition-colors">
                      Llamar
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-zinc-700 text-sm text-center leading-relaxed">
                  Ese negocio lleva meses sin web.{" "}
                  <span className="text-zinc-500">Tú podrías tener el proyecto esta semana.</span>
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── MOBILE SCREENSHOT ZONE — placeholder para captura real ── */}
          <section className="px-6 py-20 md:py-28" style={{ background: "#08080f" }}>
            <div className="max-w-sm mx-auto text-center">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-10">
                  Funciona desde tu móvil
                </p>
                {/* Phone frame */}
                <div className="relative mx-auto" style={{ width: 220 }}>
                  <div
                    className="rounded-[2.5rem] border-2 border-zinc-800 overflow-hidden"
                    style={{
                      background: "#0a0a14",
                      boxShadow: "0 0 0 6px #0d0d1a, 0 0 60px rgba(99,102,241,0.07), 0 40px 80px rgba(0,0,0,0.5)",
                      paddingTop: 12,
                      paddingBottom: 12,
                    }}
                  >
                    <div className="mx-auto w-16 h-1.5 bg-zinc-800 rounded-full mb-4" />
                    <div
                      className="mx-3 rounded-2xl border border-dashed border-indigo-500/20 flex flex-col items-center justify-center gap-3 p-4"
                      style={{ background: "rgba(99,102,241,0.03)", height: 320 }}
                    >
                      <span className="text-[9px] font-mono text-indigo-500/35 uppercase tracking-widest text-center leading-relaxed">
                        Screenshot móvil<br />aquí<br /><br />Recomendado<br />440 × 960
                      </span>
                    </div>
                    <div className="mx-auto w-20 h-1 bg-zinc-800 rounded-full mt-4" />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── CINEMATIC DASHBOARD — placeholder para captura amplia ── */}
          <section className="px-6 py-10 md:py-14" style={{ background: "#0a0a12" }}>
            <Reveal>
              <div className="max-w-6xl mx-auto">
                <div
                  className="rounded-2xl border border-dashed border-indigo-500/15 overflow-hidden"
                  style={{
                    aspectRatio: "21/9",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(8,8,18,1) 100%)",
                    boxShadow: "0 0 100px rgba(99,102,241,0.04)",
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <span className="text-[10px] font-mono text-indigo-500/35 uppercase tracking-widest text-center px-4">
                      Dashboard — captura cinematográfica aquí (21:9)
                    </span>
                    <div className="w-16 h-px bg-indigo-500/10" />
                    <span className="text-xs text-zinc-800">Recomendado: 2400 × 1000</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── DEMO — vídeo del producto ── */}
          <section id="demo" className="px-6 py-24 md:py-32" style={{ background: "#0d0d18" }}>
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-6">
                  {t("demo.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-10"
                  style={{ fontSize: "clamp(26px, 4vw, 48px)" }}
                >
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div
                  className="rounded-2xl overflow-hidden border border-white/10 bg-black"
                  style={{
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.6)",
                  }}
                >
                  <video
                    className="w-full bg-black brightness-110"
                    autoPlay
                    loop
                    muted
                    playsInline
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
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]"
                    >
                      {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── SOCIAL PROOF — placeholder para testimonios reales ── */}
          <section className="px-6 py-20 md:py-28" style={{ background: "#08080f" }}>
            <div className="max-w-5xl mx-auto">
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
                      <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">
                        Testimonio real aquí
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precios" style={{ background: "#090912" }} className="px-6 py-24 md:py-32">
            <div className="max-w-5xl mx-auto">
                <Reveal>
                  <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-5">
                    {t("pricingSection.label")}
                  </p>
                  <h2
                    className="font-black tracking-tighter text-white mb-4"
                    style={{ fontSize: "clamp(26px, 4vw, 50px)" }}
                  >
                    {t("pricingSection.title")}
                    <span className="text-indigo-400">{t("pricingSection.titleHighlight")}</span>
                  </h2>
                  <div className="flex items-start gap-2.5 mb-12 max-w-md">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      <span className="text-zinc-300">{t("pricingSection.valueNote")}</span>{" "}
                      <span className="text-emerald-500">{t("pricingSection.valueHighlight")}</span>
                    </p>
                  </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-4 items-start max-w-4xl">
                  {PLANS.map((plan, i) => (
                    <Reveal key={i} delay={i * 80}>
                      <div
                        className={`relative rounded-2xl border flex flex-col p-6 transition-all ${
                          plan.popular
                            ? "border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.08)]"
                            : "border-white/[0.06] hover:border-white/[0.10]"
                        }`}
                        style={{
                          background: plan.popular
                            ? "linear-gradient(145deg, rgba(99,102,241,0.07) 0%, rgba(9,9,18,1) 100%)"
                            : "rgba(255,255,255,0.015)",
                        }}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-5 bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {t("pricingSection.mostPopular")}
                          </div>
                        )}
                        <div className="mb-4">
                          <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
                          <p className="text-xs text-zinc-600">{plan.desc}</p>
                        </div>
                        <div className="mb-5">
                          {"originalPrice" in plan && plan.originalPrice && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-zinc-700 line-through">{plan.originalPrice as string}</span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                -{Math.round((1 - parseInt(plan.price.replace("$", "")) / parseInt((plan.originalPrice as string).replace("$", ""))) * 100)}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                            <span className="text-zinc-600 text-sm">{plan.period}</span>
                          </div>
                        </div>
                        <ul className="space-y-2 mb-6 flex-1">
                          {plan.features.map((feat, j) => (
                            <li key={j} className="flex items-center gap-2.5 text-sm">
                              {feat.ok ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-white/[0.08] shrink-0" />
                              )}
                              <span className={feat.ok ? "text-zinc-300" : "text-zinc-700"}>{feat.text}</span>
                            </li>
                          ))}
                        </ul>
                        <SignedOut>
                          {"checkoutKey" in plan && plan.checkoutKey ? (
                            <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                plan.popular
                                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                  : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.07]"
                              }`}>
                                {plan.cta}
                              </button>
                            </SignInButton>
                          ) : (
                            <SignInButton mode="modal">
                              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                plan.popular
                                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                  : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.07]"
                              }`}>
                                {plan.cta}
                              </button>
                            </SignInButton>
                          )}
                        </SignedOut>
                        <SignedIn>
                          <Link
                            href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                            className={`block text-center w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                              plan.popular
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.07]"
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

          {/* ── FAQ ── */}
          <section style={{ background: "#0d0d18" }} className="px-6 py-24">
            <div className="max-w-2xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest mb-5">{t("faq.label")}</p>
                <h2 className="font-black tracking-tighter text-white mb-10" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>
                  {t("faq.title")}
                </h2>
              </Reveal>
              <div itemScope itemType="https://schema.org/FAQPage" className="space-y-2">
                {FAQS.map((faq, i) => (
                  <Reveal key={i} delay={i * 40}>
                    <details
                      itemProp="mainEntity"
                      itemScope
                      itemType="https://schema.org/Question"
                      name="faq"
                      className="group border border-white/[0.06] rounded-xl overflow-hidden open:border-white/[0.09]"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                        <span itemProp="name" className="text-sm font-semibold text-white">{faq.q}</span>
                        <svg
                          className="w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200 group-open:rotate-180"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div
                        itemProp="acceptedAnswer"
                        itemScope
                        itemType="https://schema.org/Answer"
                        className="px-5 pb-5"
                      >
                        <p itemProp="text" className="text-zinc-500 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </details>
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
            {/* Ambient glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-10">
                  Empieza ahora
                </p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-6"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-indigo-400">{t("finalCta.title2")}</span>
                </h2>
                <p className="text-zinc-600 text-base mb-12">
                  {t("finalCta.subtitle")}
                </p>
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
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#050508] font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all"
                    >
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
          <footer
            className="border-t border-white/[0.04] py-8 px-6"
            style={{ background: "#050508" }}
          >
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
