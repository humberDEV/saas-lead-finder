import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle, Sparkles, Zap,
} from "lucide-react";
import CursorGlow from "./CursorGlow";
import Reveal from "./Reveal";
import AnimatedSteps from "./AnimatedSteps";

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

const BG = {
  base:  "#0e0b1e",
  deep:  "#0b0917",
  mid:   "#120f26",
  alt:   "#100d22",
};

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

  const HOW_IT_WORKS = [
    {
      n: "01",
      title: t("howItWorks.step1Title"),
      desc: "Selecciona el tipo de negocio — barberías, clínicas dentales, talleres mecánicos, restaurantes, fisioterapeutas y más de 35 nichos — y la ciudad o barrio donde quieres prospectar.",
    },
    {
      n: "02",
      title: t("howItWorks.step2Title"),
      desc: "Huntly analiza Google Maps, filtra los negocios locales sin página web, extrae su teléfono disponible y les asigna un score de oportunidad según reseñas, valoración y actividad.",
    },
    {
      n: "03",
      title: t("howItWorks.step3Title"),
      desc: "Llama directamente, envía un WhatsApp con el mensaje de apertura generado automáticamente o guarda el lead en tu cartera de clientes. Todo en una sola pantalla.",
    },
  ];

  return (
    <div className="min-h-screen text-white antialiased overflow-x-hidden" style={{ background: BG.base }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Huntly",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Herramienta de prospección local que escanea Google Maps para encontrar negocios sin página web. Ideal para freelancers web y agencias.",
              offers: { "@type": "AggregateOffer", lowPrice: "0", highPrice: "19", priceCurrency: "USD" },
            },
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "Cómo encontrar negocios sin web con Huntly",
              description: "Guía paso a paso para encontrar clientes potenciales de diseño web usando Huntly",
              step: [
                { "@type": "HowToStep", position: 1, name: "Elige nicho y ciudad", text: "Selecciona el tipo de negocio y la ciudad o barrio donde quieres buscar clientes web." },
                { "@type": "HowToStep", position: 2, name: "Huntly detecta negocios sin página web", text: "Huntly analiza Google Maps, filtra los negocios sin web y extrae su teléfono con un score de oportunidad." },
                { "@type": "HowToStep", position: 3, name: "Contacta y cierra el cliente", text: "Llama o envía un WhatsApp con el mensaje generado automáticamente para cerrar la venta." },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Huntly",
              url: "https://tryhuntly.com",
              description: "Herramienta de prospección local para encontrar negocios sin web y conseguir clientes de diseño web",
            },
          ]),
        }}
      />

      <div aria-hidden className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: "repeat", backgroundSize: "180px" }}
      />
      <CursorGlow />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav
          className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md border-b border-violet-500/[0.08]"
          style={{ background: "rgba(14,11,30,0.92)" }}
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="font-bold tracking-tight">
                Hunt<span className="text-violet-400">ly</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg border border-violet-500/30 text-violet-200 hover:bg-violet-500/10 hover:border-violet-400/50 transition-all">
                    {t("nav.signIn")}
                  </button>
                </SignInButton>
                <Link
                  href="#precios"
                  className="relative flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-lg text-white overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)",
                    backgroundSize: "200% 100%",
                    boxShadow: "0 0 0 1px rgba(167,139,250,0.3), 0 0 24px rgba(139,92,246,0.5), 0 0 48px rgba(139,92,246,0.2)",
                  }}
                >
                  <span className="relative z-10">{t("nav.buyNow")}</span>
                  <ArrowRight className="relative z-10 w-3.5 h-3.5" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors text-white">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        <main className="pt-14">

          {/* ── HERO + COMPARISON — una sola sección ── */}
          <section
            className="relative px-6 overflow-hidden"
            style={{ background: BG.base }}
          >
            {/* Fondos decorativos */}
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.18) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 75% 50% at 50% 20%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 75% 50% at 50% 20%, black 0%, transparent 100%)",
                opacity: 0.12,
              }}
            />
            <div aria-hidden className="absolute top-0 inset-x-0 h-[60%] pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(139,92,246,0.11) 0%, transparent 100%)" }}
            />

            {/* ── Hero text ── */}
            <div className="relative z-10 flex flex-col items-center text-center pt-10 pb-12 md:pt-14 md:pb-16">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 bg-violet-500/[0.10] border border-violet-500/25 rounded-full px-4 py-1.5 mb-10">
                  <Zap className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-200 tracking-wide">{t("hero.badge")}</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1
                  className="font-black tracking-tighter leading-[0.92] text-white mb-6 max-w-3xl"
                  style={{ fontSize: "clamp(36px, 6vw, 84px)" }}
                >
                  {t("hero.title1")}
                  <br />
                  {t("hero.title2")}
                  <br />
                  <span className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                    {t("hero.title3")}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-base md:text-lg text-violet-200 mb-10 max-w-sm leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex flex-col items-center gap-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
                      >
                        {t("hero.ctaPrimary")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard"
                      className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                    >
                      {t("hero.ctaDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-violet-400">{t("hero.freeNote")}</span>
                </div>
              </Reveal>
            </div>

            {/* ── Comparison ── */}
            <div className="relative z-10 max-w-4xl mx-auto pb-16">

              {/* Desktop: 3-col grid */}
              <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
                <div className="flex flex-col gap-4">
                  <p className="font-black tracking-tighter leading-none text-center" style={{ fontSize: "clamp(22px, 3vw, 36px)", color: "rgba(248,113,113,0.55)" }}>Sin Huntly</p>
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(248,113,113,0.12)" }}>
                    <img src="/maps.png" alt="Búsqueda manual en Google Maps" className="w-full block" style={{ opacity: 0.8 }} />
                  </div>
                  <p className="text-center font-semibold" style={{ fontSize: "clamp(13px, 1.5vw, 16px)", color: "rgba(248,113,113,0.5)" }}>
                    3–4 horas por semana<br /><span style={{ color: "rgba(248,113,113,0.35)", fontSize: "0.85em" }}>buscando a mano</span>
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 pt-10 self-stretch">
                  <div className="flex-1 w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.3))" }} />
                  <div className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.20), rgba(167,139,250,0.08))", border: "1px solid rgba(139,92,246,0.50)", boxShadow: "0 0 24px rgba(139,92,246,0.30)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </div>
                  <div className="flex-1 w-px" style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.3), transparent)" }} />
                </div>
                <div className="flex flex-col gap-4">
                  <p className="font-black tracking-tighter leading-none text-center text-white" style={{ fontSize: "clamp(22px, 3vw, 36px)", textShadow: "0 0 40px rgba(139,92,246,0.5)" }}>Con Huntly</p>
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.22)", boxShadow: "0 0 40px rgba(139,92,246,0.10)" }}>
                    <img src="/huntly.png" alt="Dashboard Huntly con leads filtrados" className="w-full block" />
                  </div>
                  <p className="text-center font-semibold text-violet-300" style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>
                    10 segundos por búsqueda<br /><span className="text-violet-400/60" style={{ fontSize: "0.85em" }}>leads listos para contactar</span>
                  </p>
                </div>
              </div>

              {/* Mobile: stacked */}
              <div className="md:hidden flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <p className="font-black tracking-tighter text-center text-lg" style={{ color: "rgba(248,113,113,0.55)" }}>Sin Huntly</p>
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(248,113,113,0.12)" }}>
                    <img src="/maps.png" alt="Búsqueda manual en Google Maps" className="w-full block" style={{ opacity: 0.8 }} />
                  </div>
                  <p className="text-center text-sm font-semibold" style={{ color: "rgba(248,113,113,0.5)" }}>3–4 horas por semana buscando a mano</p>
                </div>

                {/* Down arrow */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.20), rgba(167,139,250,0.08))", border: "1px solid rgba(139,92,246,0.50)", boxShadow: "0 0 20px rgba(139,92,246,0.25)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="font-black tracking-tighter text-center text-lg text-white" style={{ textShadow: "0 0 30px rgba(139,92,246,0.5)" }}>Con Huntly</p>
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.22)", boxShadow: "0 0 30px rgba(139,92,246,0.10)" }}>
                    <img src="/huntly.png" alt="Dashboard Huntly con leads filtrados" className="w-full block" />
                  </div>
                  <p className="text-center text-sm font-semibold text-violet-300">10 segundos por búsqueda · leads listos para contactar</p>
                </div>
              </div>

            </div>
          </section>

          {/* ── TICKER ── */}
          <div
            className="border-b border-violet-500/[0.07] py-5 overflow-hidden relative"
            style={{
              background: BG.base,
              maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <div className="flex animate-marquee whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 mx-10 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Sin web
                  </span>
                  <span className="text-xs font-medium text-violet-200">{item.name}</span>
                  <span className="text-violet-700">·</span>
                  <span className="text-xs text-violet-400">{item.city}</span>
                  <span className="text-violet-700">·</span>
                  <span className="text-xs text-yellow-400 font-medium">★ {item.rating}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── PAIN ── */}
          <section
            className="relative px-6 py-20 md:py-28 overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.alt}, ${BG.mid}, ${BG.alt})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(248,113,113,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-12">
                  {t("problem.label")}
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h2
                  className="font-black tracking-tighter leading-[1.0] text-white mb-14 max-w-3xl"
                  style={{ fontSize: "clamp(24px, 4vw, 48px)" }}
                >
                  ¿Cuántas horas llevas<br />
                  <span className="text-violet-300">buscando clientes en Google Maps?</span>
                </h2>
              </Reveal>
              <div className="space-y-5 md:space-y-6">
                <Reveal delay={0}><p className="font-black tracking-tighter leading-tight text-violet-400/80" style={{ fontSize: "clamp(18px, 2.5vw, 30px)" }}>Otra vez abrir Maps.</p></Reveal>
                <Reveal delay={60}><p className="font-black tracking-tighter leading-tight text-violet-300" style={{ fontSize: "clamp(21px, 3vw, 38px)" }}>Otra vez revisar si tienen web.</p></Reveal>
                <Reveal delay={120}><p className="font-black tracking-tighter leading-tight text-violet-100" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>Otra vez copiar el teléfono.</p></Reveal>
                <Reveal delay={180}><p className="font-black tracking-tighter leading-tight text-white" style={{ fontSize: "clamp(27px, 4.2vw, 54px)" }}>Otra vez que no contesten.</p></Reveal>
                <Reveal delay={240}>
                  <p
                    className="font-black tracking-tighter leading-tight"
                    style={{ fontSize: "clamp(38px, 6vw, 76px)", color: "#f87171", textShadow: "0 0 80px rgba(248,113,113,0.25)" }}
                  >
                    Horas<br />sin facturar.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── DEMO ── */}
          <section id="demo" className="px-6 py-20 md:py-24" style={{ background: BG.mid }}>
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">{t("demo.label")}</p>
                <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(22px, 3vw, 40px)" }}>
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="rounded-2xl overflow-hidden border border-violet-500/15 bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 24px 48px rgba(0,0,0,0.5)" }}
                >
                  <video className="w-full bg-black brightness-110" autoPlay loop muted playsInline
                    src="https://res.cloudinary.com/dufnkxsfm/video/upload/v1777248069/minidemo_kzfinl.mp4"
                  />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-8 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(139,92,246,0.3)]">
                        {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(139,92,246,0.3)]">
                      {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── CÓMO FUNCIONA ── */}
          <section id="como-funciona" className="px-6 py-20 md:py-28" style={{ background: BG.alt }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">{t("howItWorks.label")}</p>
                <h2
                  className="font-black tracking-tighter text-white mb-12"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {t("howItWorks.title")}
                  <span className="text-violet-400">{t("howItWorks.titleHighlight")}</span>
                </h2>
              </Reveal>
              <AnimatedSteps steps={HOW_IT_WORKS} />
              <Reveal delay={200}>
                <div className="mt-10 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_24px_rgba(139,92,246,0.3)]">
                        Probarlo gratis <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_24px_rgba(139,92,246,0.3)]">
                      Ir al dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── PARA QUIÉN ES ── */}
          <section className="px-6 py-20 md:py-28 overflow-hidden" style={{ background: BG.mid }}>
            <div className="max-w-5xl mx-auto">

              {/* Header */}
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-5">
                  {t("audience.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-16 max-w-xl"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {t("audience.title")}
                </h2>
              </Reveal>

              {/* Editorial rows */}
              <div className="space-y-0">
                {[
                  {
                    num: "01",
                    emoji: "🧑‍💻",
                    title: "Freelancers de diseño web",
                    desc: "Prospecta en 5 minutos lo que antes te llevaba horas revisando Google Maps a mano. Encuentra negocios locales sin web listos para contratar.",
                    stat: "20+ leads listos en menos de 30 segundos",
                    color: "#a78bfa",
                    cta: "Encontrar mi primer cliente",
                  },
                  {
                    num: "02",
                    emoji: "🏢",
                    title: "Agencias web pequeñas",
                    desc: "Llena tu pipeline de oportunidades de venta sin contratar a nadie para prospección. Búsquedas ilimitadas por ciudad y nicho.",
                    stat: "Pipeline lleno sin contratar a nadie",
                    color: "#e879f9",
                    cta: "Llenar mi pipeline ahora",
                  },
                  {
                    num: "03",
                    emoji: "⚡",
                    title: "Creadores web con IA",
                    desc: "Haces webs en pocas horas con Framer, Webflow o herramientas de IA. Huntly te encuentra los clientes que todavía no las tienen.",
                    stat: "Clientes que necesitan exactamente lo que ofreces",
                    color: "#38bdf8",
                    cta: "Buscar clientes sin web",
                  },
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <div
                      className="group relative py-10 md:py-12"
                      style={{
                        borderTop: "1px solid rgba(139,92,246,0.10)",
                      }}
                    >
                      {/* Hover accent line */}
                      <div
                        className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500 pointer-events-none"
                        style={{ background: `linear-gradient(to right, ${item.color}, transparent)` }}
                      />

                      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">

                        {/* Number + emoji */}
                        <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-20 shrink-0">
                          <span
                            className="font-black leading-none transition-all duration-300"
                            style={{
                              fontSize: "clamp(40px, 5vw, 64px)",
                              color: "rgba(139,92,246,0.18)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {item.num}
                          </span>
                          <span className="text-2xl md:text-3xl">{item.emoji}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-black tracking-tight text-white mb-3 transition-colors duration-300 group-hover:text-violet-100"
                            style={{ fontSize: "clamp(18px, 2.2vw, 28px)" }}
                          >
                            {item.title}
                          </h3>
                          <p className="text-sm text-violet-200/80 leading-relaxed mb-5 max-w-lg">
                            {item.desc}
                          </p>

                          {/* Stat callout */}
                          <div className="inline-flex items-center gap-2.5">
                            <div
                              className="w-1 h-4 rounded-full shrink-0"
                              style={{ background: item.color, opacity: 0.7 }}
                            />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: item.color, opacity: 0.85 }}
                            >
                              {item.stat}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="shrink-0 md:self-center">
                          <SignedOut>
                            <SignInButton mode="modal">
                              <button className="flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-4 py-2 rounded-xl transition-colors shadow-[0_0_20px_rgba(139,92,246,0.25)] whitespace-nowrap">
                                {item.cta} <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            </SignInButton>
                          </SignedOut>
                          <SignedIn>
                            <Link
                              href="/search"
                              className="flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-4 py-2 rounded-xl transition-colors shadow-[0_0_20px_rgba(139,92,246,0.25)] whitespace-nowrap"
                            >
                              {item.cta} <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </Link>
                          </SignedIn>
                        </div>

                      </div>
                    </div>
                  </Reveal>
                ))}

                {/* Bottom border */}
                <div style={{ borderTop: "1px solid rgba(139,92,246,0.10)" }} />
              </div>

            </div>
          </section>

          {/* ── NICHOS + CIUDADES ── */}
          <section className="px-6 py-16 md:py-20" style={{ background: BG.alt }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Dónde funciona</p>
                <h2 className="font-black tracking-tighter text-white mb-3" style={{ fontSize: "clamp(20px, 2.8vw, 36px)" }}>
                  Más de 35 nichos. Cualquier ciudad.
                </h2>
                <p className="text-sm text-violet-200 mb-10 max-w-xl leading-relaxed">
                  Barberías, clínicas dentales, talleres mecánicos, fisioterapeutas, gestorías, restaurantes y más — en Madrid, Barcelona, Valencia, Sevilla, México DF, Buenos Aires o la ciudad que elijas.
                </p>
              </Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[
                  "Barberías","Clínicas Dentales","Talleres Mecánicos","Fisioterapeutas",
                  "Peluquerías","Gestorías","Gimnasios","Restaurantes",
                  "Centros de Estética","Ópticas","Reformas","Psicólogos",
                  "Fontaneros","Electricistas","Nutricionistas","Fotógrafos",
                ].map((niche) => (
                  <div
                    key={niche}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-500/[0.10] text-xs text-violet-300 font-medium"
                    style={{ background: "rgba(139,92,246,0.04)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {niche}
                  </div>
                ))}
              </div>
              <Reveal delay={80}>
                <p className="text-xs text-violet-500 mt-6">
                  ¿No ves tu nicho? Huntly también acepta búsquedas personalizadas — escribe cualquier sector o tipo de negocio.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── PRICING ── compact to fit in viewport ── */}
          <section id="precios" className="px-6 py-14 md:py-20" style={{ background: BG.deep }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-3">
                  {t("pricingSection.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-3"
                  style={{ fontSize: "clamp(22px, 3.5vw, 42px)" }}
                >
                  {t("pricingSection.title")}
                  <span className="text-violet-400">{t("pricingSection.titleHighlight")}</span>
                </h2>
              </Reveal>

              {/* 20× value callout */}
              <Reveal delay={60}>
                <div
                  className="rounded-2xl border border-violet-500/20 p-5 mb-8 max-w-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="shrink-0 leading-none">
                      <span
                        className="font-black text-transparent bg-clip-text"
                        style={{ fontSize: "clamp(40px, 5vw, 60px)", backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)" }}
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
              </Reveal>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <div
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
                      {/* Hover glow on non-popular cards */}
                      {!plan.popular && (
                        <div
                          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.28), 0 0 40px rgba(139,92,246,0.08)" }}
                        />
                      )}

                      {plan.popular && (
                        <div
                          className="absolute top-0 left-8 right-8 h-px"
                          style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.9), transparent)" }}
                        />
                      )}

                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-mono text-violet-300/90 uppercase tracking-widest">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t("pricingSection.mostPopular")}
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
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
                        <p className="text-xs text-violet-200 mt-1.5 leading-relaxed">{plan.desc}</p>
                      </div>

                      <ul className="space-y-2.5 mb-7 flex-1">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            {feat.ok ? (
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-emerald-500/80"}`} />
                            ) : (
                              <span className="w-3.5 h-3.5 shrink-0 mt-1.5 flex items-center"><span className="w-2.5 h-px bg-violet-700/40 block" /></span>
                            )}
                            <span className={`text-xs leading-snug ${feat.ok ? (plan.popular ? "text-white" : "text-violet-200") : "text-violet-600"}`}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <SignedOut>
                        {"checkoutKey" in plan && plan.checkoutKey ? (
                          <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                            <button className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        ) : (
                          <SignInButton mode="modal">
                            <button className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        )}
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                          className={`block text-center w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                            plan.popular
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                              : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
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
          <section className="px-6 py-20 md:py-28" style={{ background: BG.mid }}>
            <div className="max-w-2xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">{t("faq.label")}</p>
                <h2
                  className="font-black tracking-tighter text-white mb-10"
                  style={{ fontSize: "clamp(22px, 3vw, 36px)" }}
                >
                  {t("faq.title")}
                </h2>
              </Reveal>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <Reveal key={i} delay={i * 35}>
                    <details
                      name="faq"
                      className="group border border-violet-500/[0.10] rounded-xl overflow-hidden open:border-violet-500/[0.20]"
                      style={{ background: "rgba(139,92,246,0.04)" }}
                    >
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                        <span className="text-sm font-semibold text-white">{faq.q}</span>
                        <svg
                          className="w-4 h-4 text-violet-500 shrink-0 transition-transform duration-200 group-open:rotate-180"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-violet-200 leading-relaxed border-t border-violet-500/[0.08] pt-4">
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
            className="relative px-6 py-28 md:py-40 text-center overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.mid}, ${BG.base})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-8">Empieza ahora</p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-5"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-violet-400">{t("finalCta.title2")}</span>
                </h2>
                <p className="text-violet-200 text-base mb-10">{t("finalCta.subtitle")}</p>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex flex-col items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.12)" }}
                      >
                        {t("finalCta.ctaButton")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard"
                      className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                    >
                      {t("finalCta.ctaDashboard")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-violet-400">{t("finalCta.freeNote")}</span>
                  <Link href="#precios" className="text-xs text-violet-400 hover:text-violet-200 transition-colors">
                    {t("finalCta.viewPlans")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="border-t border-violet-500/[0.07] py-8 px-6" style={{ background: BG.base }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-400/75">Huntly</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-violet-400/75">
                <Link href="#como-funciona" className="hover:text-violet-200 transition-colors">{t("footer.howItWorks")}</Link>
                <Link href="#precios" className="hover:text-violet-200 transition-colors">{t("footer.pricing")}</Link>
                <Link href="/es/para-freelancers" className="hover:text-violet-200 transition-colors">Freelancers web</Link>
                <Link href="/es/para-agencias" className="hover:text-violet-200 transition-colors">Agencias web</Link>
                <Link href="/es/blog/conseguir-clientes-web" className="hover:text-violet-200 transition-colors">Guía de prospección</Link>
                <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200 transition-colors">{t("footer.contact")}</Link>
              </div>
              <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
