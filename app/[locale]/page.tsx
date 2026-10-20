import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle } from "lucide-react";
import Reveal from "./Reveal";
import AnimatedSteps from "./AnimatedSteps";

const BG = {
  base: "#08090b",
  deep: "#090b0d",
  mid: "#0e1012",
  alt: "#0d0f11",
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
        ...(tPlans.raw("free.features") as string[]).map((text: string) => ({
          text,
          ok: true,
        })),
        ...(tPlans.raw("free.disabledFeatures") as string[]).map(
          (text: string) => ({ text, ok: false }),
        ),
      ],
      cta: tPlans("free.cta"),
      popular: false,
    },
    {
      name: tPlans("go.name"),
      price: "$9",
      period: "/mes",
      desc: tPlans("go.desc"),
      features: (tPlans.raw("go.features") as string[]).map((text: string) => ({
        text,
        ok: true,
      })),
      cta: tPlans("go.cta"),
      popular: true,
      checkoutKey: "go",
    },
    {
      name: tPlans("pro.name"),
      price: "$19",
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map(
        (text: string) => ({ text, ok: true }),
      ),
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
      desc: t("howItWorks.step1Desc"),
    },
    {
      n: "02",
      title: t("howItWorks.step2Title"),
      desc: t("howItWorks.step2Desc"),
    },
    {
      n: "03",
      title: t("howItWorks.step3Title"),
      desc: t("howItWorks.step3Desc"),
    },
  ];

  const AUDIENCE = [
    {
      num: "01",
      title: t("audience.audience1Title"),
      desc: t("audience.audience1Desc"),
      stat: t("audience.audience1Stat"),
      cta: t("audience.audience1Cta"),
    },
    {
      num: "02",
      title: t("audience.audience2Title"),
      desc: t("audience.audience2Desc"),
      stat: t("audience.audience2Stat"),
      cta: t("audience.audience2Cta"),
    },
    {
      num: "03",
      title: t("audience.audience3Title"),
      desc: t("audience.audience3Desc"),
      stat: t("audience.audience3Stat"),
      cta: t("audience.audience3Cta"),
    },
  ];

  return (
    <div
      className="huntly-landing min-h-screen text-white antialiased overflow-x-hidden"
      style={{ background: BG.base }}
    >
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
              description:
                "Herramienta de prospección local que escanea Google Maps para encontrar negocios sin página web. Ideal para freelancers web y agencias.",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "0",
                highPrice: "19",
                priceCurrency: "USD",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "Cómo encontrar negocios sin web con Huntly",
              description:
                "Guía paso a paso para encontrar clientes potenciales de diseño web usando Huntly",
              step: [
                {
                  "@type": "HowToStep",
                  position: 1,
                  name: "Elige nicho y ciudad",
                  text: "Selecciona el tipo de negocio y la ciudad o barrio donde quieres buscar clientes web.",
                },
                {
                  "@type": "HowToStep",
                  position: 2,
                  name: "Huntly detecta negocios sin página web",
                  text: "Huntly analiza Google Maps, filtra los negocios sin web y extrae su teléfono con un score de oportunidad.",
                },
                {
                  "@type": "HowToStep",
                  position: 3,
                  name: "Contacta y cierra el cliente",
                  text: "Llama o envía un WhatsApp con el mensaje generado automáticamente para cerrar la venta.",
                },
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
              description:
                "Herramienta de prospección local para encontrar negocios sin web y conseguir clientes de diseño web",
            },
          ]),
        }}
      />

      <div className="relative z-10">
        {/* ── NAV ── */}
        <nav
          className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[#282831]"
          style={{ background: BG.base }}
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <Link
              href="#"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-bold tracking-tight">
                Hunt<span className="text-violet-400">ly</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="huntly-text-button px-3">
                    {t("nav.signIn")}
                  </button>
                </SignInButton>
                <Link
                  href="#precios"
                  className="huntly-primary-button !min-h-0 !px-4 !py-2"
                >
                  <span className="relative z-10">{t("nav.buyNow")}</span>
                  <ArrowRight className="relative z-10 w-3.5 h-3.5" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="huntly-primary-button !min-h-0 !px-4 !py-2"
                >
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        <main className="pt-14">
          {/* Product-first hero */}
          <section
            className="border-b border-[#303039]"
            style={{ background: BG.base }}
          >
            <div className="mx-auto grid max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:pb-28 lg:pt-28">
              <div className="min-w-0">
                <Reveal>
                  <p className="huntly-kicker mb-7">{t("hero.badge")}</p>
                  <h1
                    className="max-w-2xl text-white leading-[1.05]"
                    style={{ fontSize: "clamp(2.65rem, 4.15vw, 4.5rem)" }}
                  >
                    <span className="block">{t("hero.title1")}</span>
                    <span className="block">{t("hero.title2")}</span>
                    <span className="block text-violet-300">
                      {t("hero.title3")}
                    </span>
                  </h1>
                </Reveal>
                <Reveal delay={100}>
                  <p className="mt-7 max-w-lg text-base leading-7 text-[#b8b6c3] md:text-lg">
                    {t("hero.subtitle")}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="huntly-primary-button w-full sm:w-auto">
                          {t("hero.ctaPrimary")}{" "}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link
                        href="/dashboard"
                        className="huntly-primary-button w-full sm:w-auto"
                      >
                        {t("hero.ctaDashboard")}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </SignedIn>
                    <Link href="#demo" className="huntly-text-button">
                      {t("hero.ctaDemo")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-[#777481]">
                    {t("hero.freeNote")}
                  </p>
                </Reveal>
              </div>

              <Reveal delay={130} className="min-w-0">
                <figure className="w-full min-w-0 overflow-hidden rounded-md border border-[#3a3e43] bg-[#141719]">
                  <div className="flex items-center justify-between border-b border-[#35343e] px-4 py-3">
                    <span
                      className="h-2 w-2 rounded-[2px] bg-violet-400"
                      aria-hidden
                    />
                  </div>
                  <img
                    src="/huntly.png"
                    alt={t("comparison.withImgAlt")}
                    className="block w-full max-w-full"
                  />
                  <figcaption className="grid grid-cols-2 border-t border-[#35343e]">
                    <div className="border-r border-[#35343e] px-4 py-5 sm:px-6">
                      <span className="huntly-kicker !text-[#888591]">
                        {t("comparison.withoutTitle")}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-[#aaa9b5]">
                        {t("comparison.withoutStat")}
                      </p>
                      <p className="mt-1 text-xs text-[#777481]">
                        {t("comparison.withoutStatSub")}
                      </p>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                      <span className="huntly-kicker">
                        {t("comparison.withTitle")}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {t("comparison.withStat")}
                      </p>
                      <p className="mt-1 text-xs text-[#aaa6b5]">
                        {t("comparison.withStatSub")}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>

          {/* Problem / consequences */}
          <section
            className="px-6 py-20 md:py-28"
            style={{ background: BG.alt }}
          >
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
              <Reveal>
                <p className="huntly-kicker mb-6">{t("problem.label")}</p>
                <h2
                  className="max-w-lg text-white leading-[1.1]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3.75rem)" }}
                >
                  {t("problem.headline1")}{" "}
                  <span className="text-violet-300">
                    {t("problem.headline2")}
                  </span>
                </h2>
                <p className="mt-10 border-l-2 border-violet-400 pl-5 text-2xl font-semibold leading-tight text-white md:text-3xl">
                  {t("problem.painFinal1")} {t("problem.painFinal2")}
                </p>
              </Reveal>
              <div className="border-t border-[#34343f]">
                {[
                  t("problem.pain1"),
                  t("problem.pain2"),
                  t("problem.pain3"),
                  t("problem.pain4"),
                ].map((pain, i) => (
                  <Reveal key={pain} delay={i * 55}>
                    <div className="grid grid-cols-[2rem_1fr] gap-4 border-b border-[#34343f] py-5 sm:grid-cols-[3rem_1fr] sm:py-7">
                      <span className="font-mono text-xs text-violet-400">
                        0{i + 1}
                      </span>
                      <p className="text-base font-medium leading-6 text-[#d9d7e1] sm:text-lg">
                        {pain}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── DEMO ── */}
          <section
            id="demo"
            className="px-6 py-20 md:py-24"
            style={{ background: BG.mid }}
          >
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h2
                  className="font-black tracking-tighter text-white mb-8"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="rounded-2xl overflow-hidden border border-[#30303b] bg-black">
                  <video
                    className="w-full bg-black brightness-110"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="https://res.cloudinary.com/dkdzun2xd/video/upload/v1783957970/demo_huntly_gdszbm.mp4"
                  />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-8 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="huntly-primary-button">
                        {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="huntly-primary-button">
                      {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── CÓMO FUNCIONA ── */}
          <section
            id="como-funciona"
            className="px-6 py-20 md:py-28"
            style={{ background: BG.alt }}
          >
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">
                  {t("howItWorks.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-12"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {t("howItWorks.title")}
                  <span className="text-violet-400">
                    {t("howItWorks.titleHighlight")}
                  </span>
                </h2>
              </Reveal>
              <AnimatedSteps steps={HOW_IT_WORKS} />
              <Reveal delay={200}>
                <div className="mt-10 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="huntly-text-button">
                        {t("howItWorks.ctaFree")}{" "}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="huntly-text-button">
                      {t("howItWorks.ctaDashboard")}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── PARA QUIÉN ES ── */}
          <section
            id="audience"
            className="px-6 py-16 md:py-20 overflow-hidden"
            style={{ background: BG.mid }}
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-5">
                  {t("audience.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-9 max-w-xl"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {t("audience.title")}
                </h2>
              </Reveal>

              <div className="grid gap-px overflow-hidden rounded-md border border-[#3a3e43] bg-[#3a3e43] md:grid-cols-3">
                {AUDIENCE.map((item, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <article className="flex h-full flex-col bg-[#141719] p-6 md:min-h-[340px] md:p-7">
                      <span className="huntly-kicker !text-[#777481]">
                        {item.num} / {t("audience.label")}
                      </span>
                      <h3 className="mt-9 text-[1.4rem] leading-tight text-white md:mt-12">
                        {item.title}
                      </h3>
                      <p className="mt-4 flex-1 text-sm leading-6 text-[#aaa9b5]">
                        {item.desc}
                      </p>
                      <p className="mt-7 border-t border-[#34343f] pt-5 text-xs font-medium leading-5 text-violet-300">
                        {item.stat}
                      </p>
                      <div className="mt-3">
                        <SignedOut>
                          <SignInButton mode="modal">
                            <button className="huntly-text-button">
                              {item.cta}{" "}
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                            </button>
                          </SignInButton>
                        </SignedOut>
                        <SignedIn>
                          <Link href="/search" className="huntly-text-button">
                            {item.cta}{" "}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        </SignedIn>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage shown as a real search, not a wall of decorative tags. */}
          <section
            id="coverage"
            className="border-y border-[#303039] px-6 py-20 md:py-28"
            style={{ background: BG.alt }}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
              <Reveal>
                <p className="huntly-kicker mb-5">{t("nichesSection.label")}</p>
                <h2
                  className="max-w-lg text-white leading-[1.1]"
                  style={{ fontSize: "clamp(2rem, 3.4vw, 3.5rem)" }}
                >
                  {t("nichesSection.title")}
                </h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-[#aaa9b5]">
                  {t("nichesSection.desc")}
                </p>
                <p className="mt-8 max-w-lg border-l-2 border-violet-500 pl-4 text-sm leading-6 text-[#c2becb]">
                  {t("nichesSection.customNote")}
                </p>
              </Reveal>
              <Reveal delay={90}>
                <div className="overflow-hidden rounded-md border border-[#3a3e43] bg-[#141719]">
                  <div className="flex items-center justify-between border-b border-[#383742] px-5 py-4">
                    <span className="huntly-kicker !text-[#aaa6b5]">
                      {t("nichesSection.exampleLabel")}
                    </span>
                    <span className="font-mono text-[11px] text-violet-300">
                      01 / 02
                    </span>
                  </div>
                  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                    <div>
                      <p className="mb-2 font-mono text-[11px] text-[#888591]">
                        {t("nichesSection.nicheLabel")}
                      </p>
                      <div className="flex min-h-12 items-center rounded-md border border-[#41464b] bg-[#1e2225] px-4 text-sm font-medium text-white">
                        {t("nichesSection.exampleNiche")}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 font-mono text-[11px] text-[#888591]">
                        {t("nichesSection.cityLabel")}
                      </p>
                      <div className="flex min-h-12 items-center rounded-md border border-[#41464b] bg-[#1e2225] px-4 text-sm font-medium text-white">
                        {t("nichesSection.exampleCity")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[#383742] px-5 py-4 sm:px-7">
                    <span className="text-xs leading-5 text-[#aaa9b5]">
                      {t("howItWorks.step1Note")}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-violet-300"
                      aria-hidden
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── PRICING ── compact to fit in viewport ── */}
          <section
            id="precios"
            className="px-6 py-14 md:py-20"
            style={{ background: BG.deep }}
          >
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
                  <span className="text-violet-400">
                    {t("pricingSection.titleHighlight")}
                  </span>
                </h2>
              </Reveal>

              {/* Value argument as a compact note, not a promotional tile. */}
              <Reveal delay={60}>
                <div className="mb-8 mt-6 flex max-w-3xl items-start gap-4 border-l-2 border-violet-500 pl-4 sm:gap-6">
                  <span className="font-mono text-sm font-medium text-violet-300">
                    20×
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-white">
                      {t("pricingSection.valueCalloutTitle")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#aaa9b5]">
                      {t("pricingSection.valueCalloutBody")}
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <div
                      className="group relative rounded-3xl flex flex-col p-6 h-full border transition-colors duration-200 hover:border-[#454554]"
                      style={{
                        background: plan.popular ? "#191d20" : "#141719",
                        borderColor: plan.popular
                          ? "rgba(167,139,250,0.55)"
                          : "#2d3236",
                      }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-mono text-violet-300/90 uppercase tracking-widest">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-violet-300 border-l-2 border-violet-400 pl-2 uppercase tracking-wider">
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
                              color: plan.popular
                                ? "#fff"
                                : "rgba(221,214,254,0.65)",
                            }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-violet-400 text-sm">
                            {plan.period}
                          </span>
                        </div>
                        <p className="text-xs text-violet-200 mt-1.5 leading-relaxed">
                          {plan.desc}
                        </p>
                      </div>

                      <ul className="space-y-2.5 mb-7 flex-1">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            {feat.ok ? (
                              <CheckCircle
                                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-emerald-500/80"}`}
                              />
                            ) : (
                              <span className="w-3.5 h-3.5 shrink-0 mt-1.5 flex items-center">
                                <span className="w-2.5 h-px bg-violet-700/40 block" />
                              </span>
                            )}
                            <span
                              className={`text-xs leading-snug ${feat.ok ? (plan.popular ? "text-white" : "text-violet-200") : "text-violet-600"}`}
                            >
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <SignedOut>
                        {"checkoutKey" in plan && plan.checkoutKey ? (
                          <SignInButton
                            mode="modal"
                            forceRedirectUrl={`/checkout/${plan.checkoutKey}`}
                          >
                            <button
                              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                                plan.popular
                                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                  : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
                              }`}
                            >
                              {plan.cta}
                            </button>
                          </SignInButton>
                        ) : (
                          <SignInButton mode="modal">
                            <button
                              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                                plan.popular
                                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                  : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200 border border-violet-500/20"
                              }`}
                            >
                              {plan.cta}
                            </button>
                          </SignInButton>
                        )}
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href={
                            "checkoutKey" in plan && plan.checkoutKey
                              ? `/checkout/${plan.checkoutKey}`
                              : "/pricing"
                          }
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
          <section
            className="px-6 py-20 md:py-28"
            style={{ background: BG.mid }}
          >
            <div className="max-w-2xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">
                  {t("faq.label")}
                </p>
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
                        <span className="text-sm font-semibold text-white">
                          {faq.q}
                        </span>
                        <svg
                          className="w-4 h-4 text-violet-500 shrink-0 transition-transform duration-200 group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
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
            style={{ background: BG.mid }}
          >
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-8">
                  {t("finalCta.label")}
                </p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-5"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-violet-400">
                    {t("finalCta.title2")}
                  </span>
                </h2>
                <p className="text-violet-200 text-base mb-10">
                  {t("finalCta.subtitle")}
                </p>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex flex-col items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#101016] font-semibold text-[15px] rounded-md hover:bg-zinc-200 transition-colors">
                        {t("finalCta.ctaButton")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#101016] font-semibold text-[15px] rounded-md hover:bg-zinc-200 transition-colors"
                    >
                      {t("finalCta.ctaDashboard")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-violet-400">
                    {t("finalCta.freeNote")}
                  </span>
                  <Link
                    href="#precios"
                    className="text-xs text-violet-400 hover:text-violet-200 transition-colors"
                  >
                    {t("finalCta.viewPlans")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer
            className="border-t border-violet-500/[0.07] py-8 px-6"
            style={{ background: BG.base }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-violet-400/75">
                  Huntly
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-violet-400/75">
                <Link
                  href="#como-funciona"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.howItWorks")}
                </Link>
                <Link
                  href="#precios"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.pricing")}
                </Link>
                <Link
                  href="/es/para-freelancers"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.freelancers")}
                </Link>
                <Link
                  href="/es/para-agencias"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.agencies")}
                </Link>
                <Link
                  href="/es/blog/conseguir-clientes-web"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.guide")}
                </Link>
                <Link
                  href="mailto:huntly@outlook.es"
                  className="hover:text-violet-200 transition-colors"
                >
                  {t("footer.contact")}
                </Link>
              </div>
              <p className="text-sm text-violet-300/20">
                © {new Date().getFullYear()} Huntly
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
