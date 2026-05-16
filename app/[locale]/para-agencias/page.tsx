import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huntly para Agencias Web — Llena tu Pipeline de Clientes",
  description:
    "Huntly ayuda a agencias web a llenar su pipeline de oportunidades de venta sin contratar SDRs. Encuentra negocios locales sin web en segundos, por nicho y ciudad. Prueba gratis.",
  keywords:
    "agencia web conseguir clientes, agencia webflow clientes, agencia diseño web leads, prospectar para agencias web, encontrar clientes agencia web",
  alternates: {
    canonical: "https://tryhuntly.com/es/para-agencias",
  },
  openGraph: {
    title: "Huntly para Agencias Web",
    description:
      "Llena tu pipeline de oportunidades sin contratar a nadie. Huntly encuentra negocios locales sin web en cualquier ciudad y nicho.",
    url: "https://tryhuntly.com/es/para-agencias",
    siteName: "Huntly",
  },
};

const BG = {
  base: "#0e0b1e",
  deep: "#0b0917",
  mid: "#120f26",
  alt: "#100d22",
};

const FAQS = [
  {
    q: "¿Puedo buscar en varias ciudades a la vez?",
    a: "Huntly hace una búsqueda por ciudad y nicho. Con el plan Pro tienes 250 búsquedas al mes — suficiente para cubrir decenas de ciudades y nichos cada semana.",
  },
  {
    q: "¿Puedo delegar las búsquedas a alguien de mi equipo?",
    a: "La cuenta de Huntly es personal, pero la herramienta es tan sencilla que cualquier persona del equipo puede usarla sin formación.",
  },
  {
    q: "¿Qué diferencia hay entre el plan Go y Pro?",
    a: "Go incluye 100 búsquedas al mes ($9). Pro incluye 250 búsquedas al mes ($19). Ambos incluyen guardar leads, historial y mensajes con IA.",
  },
  {
    q: "¿Puedo exportar los leads?",
    a: "De momento los leads se gestionan dentro de Huntly en la sección 'Mi Cartera'. Si necesitas exportación, escríbenos — lo tenemos en el roadmap.",
  },
];

export default async function ParaAgenciasPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen text-white antialiased" style={{ background: BG.base }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md border-b border-violet-500/[0.08]"
        style={{ background: "rgba(14,11,30,0.92)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/es" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="font-bold tracking-tight">
              Hunt<span className="text-violet-400">ly</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg border border-violet-500/30 text-violet-200 hover:bg-violet-500/10 transition-all">
                  Entrar
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors text-white">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="pt-14">

        {/* HERO */}
        <section className="relative px-6 py-20 md:py-32 text-center" style={{ background: BG.base }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 100%)" }}
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/[0.10] border border-violet-500/25 rounded-full px-4 py-1.5 mb-8">
              <span className="text-xs text-violet-200 tracking-wide">Para agencias web</span>
            </div>
            <h1
              className="font-black tracking-tighter leading-[0.92] text-white mb-6"
              style={{ fontSize: "clamp(32px, 5.5vw, 72px)" }}
            >
              Llena tu pipeline
              <br />
              de oportunidades
              <br />
              <span className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                sin contratar a nadie.
              </span>
            </h1>
            <p className="text-base md:text-lg text-violet-200 mb-10 max-w-lg mx-auto leading-relaxed">
              Huntly busca en Google Maps por nicho y ciudad, filtra los negocios sin página web y te entrega leads listos para contactar. Tu equipo cierra. Huntly prospecta.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                  style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
                >
                  Probar gratis — sin tarjeta
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all">
                Ir al dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.alt }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-6">Qué consigues</p>
            <h2 className="font-black tracking-tighter text-white mb-10" style={{ fontSize: "clamp(20px, 3vw, 38px)" }}>
              Prospección sistemática para
              <span className="text-violet-400"> tu agencia web.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  title: "Pipeline siempre lleno",
                  desc: "Con 250 búsquedas al mes puedes explorar decenas de nichos y ciudades. Siempre hay negocios nuevos sin web esperando.",
                },
                {
                  title: "Sin contratar SDRs",
                  desc: "Huntly hace el trabajo de prospección que normalmente requiere una persona dedicada. A $19/mes.",
                },
                {
                  title: "Leads de calidad",
                  desc: "Cada lead tiene un score de oportunidad basado en reseñas, valoración y si tiene web. Filtra solo los mejores.",
                },
                {
                  title: "Contacto inmediato",
                  desc: "Teléfono, WhatsApp y mensaje de apertura generado automáticamente. Contacta desde la misma herramienta.",
                },
                {
                  title: "CRM integrado",
                  desc: "Guarda leads, cambia su estado (pendiente, contactado, interesado, cerrado) y haz seguimiento visual.",
                },
                {
                  title: "Historial de búsquedas",
                  desc: "Relanza búsquedas anteriores con un clic. No pierdas el rastro de lo que ya has explorado.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 border border-violet-500/10"
                  style={{ background: "rgba(139,92,246,0.04)" }}
                >
                  <h3 className="font-bold text-white mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-violet-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.deep }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Planes para agencias</p>
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(20px, 3vw, 36px)" }}>
              Más barato que un almuerzo de equipo.
              <span className="text-violet-400"> Más valioso.</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  name: "Go",
                  price: "$9",
                  searches: "100 búsquedas/mes",
                  ideal: "Agencias pequeñas o en crecimiento",
                },
                {
                  name: "Pro",
                  price: "$19",
                  searches: "250 búsquedas/mes",
                  ideal: "Agencias con volumen alto de prospección",
                  popular: true,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl p-6 border"
                  style={{
                    background: plan.popular ? "linear-gradient(160deg, rgba(139,92,246,0.18) 0%, rgba(11,9,23,1) 55%)" : "rgba(139,92,246,0.04)",
                    borderColor: plan.popular ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.1)",
                  }}
                >
                  {plan.popular && (
                    <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                      Recomendado
                    </span>
                  )}
                  <p className="text-[10px] font-mono text-violet-300/90 uppercase tracking-widest mb-3">{plan.name}</p>
                  <p className="font-black text-white mb-1" style={{ fontSize: "clamp(36px, 4vw, 48px)" }}>
                    {plan.price}<span className="text-violet-400 text-sm font-normal">/mes</span>
                  </p>
                  <p className="text-sm text-violet-300 mb-2">{plan.searches}</p>
                  <p className="text-xs text-violet-400">{plan.ideal}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-2.5 mb-8">
              {[
                "Score de oportunidad en cada lead",
                "WhatsApp y llamada con un clic",
                "Mensajes de apertura generados con IA",
                "CRM integrado — Mi Cartera",
                "Historial completo de búsquedas",
                "Soporte prioritario",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-violet-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/checkout/pro">
                <button
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[15px] rounded-2xl transition-all shadow-[0_0_32px_rgba(139,92,246,0.3)]"
                >
                  Empezar con Pro — $19/mes <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.mid }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(20px, 3vw, 32px)" }}>
              Preguntas frecuentes
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  name="faq"
                  className="group border border-violet-500/[0.10] rounded-xl overflow-hidden open:border-violet-500/[0.20]"
                  style={{ background: "rgba(139,92,246,0.04)" }}
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <svg className="w-4 h-4 text-violet-500 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-violet-200 leading-relaxed border-t border-violet-500/[0.08] pt-4">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-violet-500/[0.07] py-8 px-6" style={{ background: BG.base }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/es" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-400/75">Huntly</span>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-violet-400/75">
              <Link href="/es" className="hover:text-violet-200 transition-colors">Inicio</Link>
              <Link href="/es/para-freelancers" className="hover:text-violet-200 transition-colors">Para freelancers</Link>
              <Link href="/es/blog/conseguir-clientes-web" className="hover:text-violet-200 transition-colors">Guía prospección</Link>
              <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200 transition-colors">Contacto</Link>
            </div>
            <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
