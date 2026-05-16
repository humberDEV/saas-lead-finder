import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo Conseguir Clientes de Diseño Web en 2025 — Guía Práctica",
  description:
    "Guía completa para encontrar clientes de diseño web: prospección en Google Maps, nichos más rentables, cómo contactar negocios sin página web y cerrar tu primera venta.",
  keywords:
    "conseguir clientes diseño web, cómo captar clientes web, encontrar clientes freelance web, prospectar clientes diseño web, negocios sin web clientes, primera venta diseño web",
  alternates: {
    canonical: "https://tryhuntly.com/es/blog/conseguir-clientes-web",
  },
  openGraph: {
    title: "Cómo Conseguir Clientes de Diseño Web en 2025",
    description:
      "Guía práctica: cómo encontrar negocios locales sin página web, cuáles son los nichos más rentables y cómo contactarlos para cerrar tu primera venta.",
    url: "https://tryhuntly.com/es/blog/conseguir-clientes-web",
    siteName: "Huntly",
    type: "article",
  },
};

const BG = {
  base: "#0e0b1e",
  deep: "#0b0917",
  mid: "#120f26",
  alt: "#100d22",
};

export default function GuiaConseguirClientesWeb() {
  return (
    <div className="min-h-screen text-white antialiased" style={{ background: BG.base }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Cómo Conseguir Clientes de Diseño Web en 2025 — Guía Práctica",
            description:
              "Guía completa para encontrar clientes de diseño web: prospección en Google Maps, nichos más rentables y cómo contactar negocios sin página web.",
            author: { "@type": "Organization", name: "Huntly" },
            publisher: { "@type": "Organization", name: "Huntly", url: "https://tryhuntly.com" },
            url: "https://tryhuntly.com/es/blog/conseguir-clientes-web",
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
                  Probar gratis <ArrowRight className="w-3.5 h-3.5" />
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

        {/* HEADER */}
        <section className="relative px-6 py-16 md:py-24" style={{ background: BG.base }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 100%)" }}
          />
          <div className="relative max-w-3xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Guía de prospección</p>
            <h1
              className="font-black tracking-tighter leading-[0.95] text-white mb-6"
              style={{ fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              Cómo conseguir clientes de diseño web en 2025
            </h1>
            <p className="text-base text-violet-200 leading-relaxed mb-8 max-w-2xl">
              Si vendes webs — ya sea con WordPress, Webflow, Framer o código — la mayor dificultad no es hacer la web. Es <strong className="text-white">encontrar a quién vendérsela</strong>. Esta guía te explica cómo prospectar de forma sistemática, qué nichos tienen más oportunidades y cómo usar Google Maps para encontrar clientes locales sin perder horas.
            </p>
            <div className="flex items-center gap-3 text-xs text-violet-400">
              <span>Tiempo de lectura: 5 min</span>
              <span>·</span>
              <span>Actualizado: 2025</span>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <article className="px-6 pb-20 md:pb-32" style={{ background: BG.base }}>
          <div className="max-w-3xl mx-auto space-y-16">

            {/* Section 1 */}
            <section>
              <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                El problema real: no es hacer webs, es encontrar clientes
              </h2>
              <p className="text-sm text-violet-200 leading-relaxed mb-4">
                La mayoría de freelancers y agencias web tienen el mismo problema: saben hacer webs, pero no tienen un sistema para encontrar clientes de forma consistente. Se depende de boca a boca, de publicaciones en LinkedIn que llegan a cero personas, o de plataformas de freelance donde el precio es el único criterio.
              </p>
              <p className="text-sm text-violet-200 leading-relaxed mb-4">
                La realidad es que hay millones de negocios locales — barberías, clínicas, talleres, gestorías, restaurantes — que llevan años funcionando sin página web. Tienen clientes, tienen reseñas en Google, y aun así no tienen presencia digital. Esos negocios son tu mercado.
              </p>
              <p className="text-sm text-violet-200 leading-relaxed">
                El problema es encontrarlos de forma eficiente. Buscar a mano en Google Maps puede llevar 3–4 horas por semana y producir muy pocos leads de calidad. La solución es automatizar esa búsqueda.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                Los nichos con más negocios sin web
              </h2>
              <p className="text-sm text-violet-200 leading-relaxed mb-6">
                No todos los nichos tienen el mismo volumen de negocios sin web. Estos son los que históricamente tienen más oportunidades:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  { niche: "Barberías", reason: "Negocio muy local, muchos llevan años sin renovar." },
                  { niche: "Fisioterapeutas", reason: "Profesionales independientes que no priorizan lo digital." },
                  { niche: "Talleres mecánicos", reason: "Gran volumen, poca digitalización en zonas industriales." },
                  { niche: "Gestorías y asesorías", reason: "Clientes captados por recomendación, sin presencia online." },
                  { niche: "Clínicas dentales", reason: "Alta competencia — necesitan diferenciarse con una web." },
                  { niche: "Centros de estética", reason: "Dependen de Instagram, no de una web propia." },
                  { niche: "Fontaneros y electricistas", reason: "Gremios muy locales con muy poca presencia digital." },
                  { niche: "Reformas y construcción", reason: "Dependen del boca a boca, sin portfolio online." },
                ].map((item) => (
                  <div
                    key={item.niche}
                    className="rounded-xl p-4 border border-violet-500/[0.10]"
                    style={{ background: "rgba(139,92,246,0.04)" }}
                  >
                    <p className="font-semibold text-white text-sm mb-1">{item.niche}</p>
                    <p className="text-xs text-violet-300 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-violet-200 leading-relaxed">
                Estos nichos no son exclusivos — hay oportunidades en casi todos los sectores locales. La clave es buscar en zonas concretas: un barrio, una ciudad, una zona industrial.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                Cómo usar Google Maps para encontrar clientes
              </h2>
              <p className="text-sm text-violet-200 leading-relaxed mb-4">
                Google Maps indexa millones de negocios locales con datos públicos: nombre, dirección, teléfono, valoración, número de reseñas y, lo más importante, si tienen o no una página web vinculada.
              </p>
              <p className="text-sm text-violet-200 leading-relaxed mb-4">
                La estrategia básica es:
              </p>
              <ol className="space-y-4 mb-6">
                {[
                  {
                    n: "1",
                    title: "Busca un nicho concreto en una ciudad concreta",
                    desc: 'Ej: "barberías en Murcia" o "fisioterapeutas en el barrio de Gràcia, Barcelona". Cuanto más específico, mejores resultados.',
                  },
                  {
                    n: "2",
                    title: "Filtra los que no tienen web",
                    desc: 'En Google Maps, los negocios sin web no tienen el botón "Sitio web". Eso es señal de oportunidad.',
                  },
                  {
                    n: "3",
                    title: "Prioriza por reseñas y valoración",
                    desc: "Un negocio con 20–200 reseñas y buena valoración es un cliente ideal: tiene demanda pero necesita credibilidad online.",
                  },
                  {
                    n: "4",
                    title: "Extrae el teléfono y contacta",
                    desc: "Llama o envía un WhatsApp con un mensaje personalizado. La personalización es clave para que te respondan.",
                  },
                ].map((item) => (
                  <li key={item.n} className="flex gap-4">
                    <span className="font-black text-violet-500 shrink-0 w-6 text-base">{item.n}.</span>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                      <p className="text-xs text-violet-200 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-violet-200 leading-relaxed">
                El problema de este proceso manual es que es lento. Revisar cada ficha, comprobar si tienen web y copiar el teléfono puede llevar horas. <strong className="text-white">Huntly automatiza exactamente eso</strong>: hace la búsqueda, filtra los sin web, extrae el teléfono y les asigna un score de oportunidad en segundos.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                Cómo escribir el mensaje de apertura perfecto
              </h2>
              <p className="text-sm text-violet-200 leading-relaxed mb-6">
                El mensaje inicial es determinante. Estos son los principios que mejor funcionan:
              </p>
              <div className="space-y-4 mb-6">
                {[
                  {
                    title: "Sé breve y directo",
                    desc: "No expliques todo en el primer mensaje. El objetivo es conseguir que te respondan, no cerrar la venta.",
                  },
                  {
                    title: "Menciona algo específico del negocio",
                    desc: 'Ej: "Vi que tienen 47 reseñas en Google pero no tienen página web". Eso demuestra que no es un mensaje masivo.',
                  },
                  {
                    title: "Plantea el beneficio, no el servicio",
                    desc: 'No digas "hago webs". Di: "una web puede ayudarles a aparecer en Google cuando alguien busca [su servicio] en [su ciudad]".',
                  },
                  {
                    title: "Termina con una pregunta simple",
                    desc: '"¿Les interesaría que les mostrara cómo quedaría?" es mucho más fácil de responder que una propuesta compleja.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl p-4 border border-violet-500/[0.10]"
                    style={{ background: "rgba(139,92,246,0.04)" }}
                  >
                    <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-violet-200 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-violet-200 leading-relaxed">
                Huntly genera automáticamente un mensaje de apertura personalizado para cada negocio usando sus datos reales (nombre, reseñas, sector). Puedes editarlo o enviarlo directamente por WhatsApp desde la herramienta.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                Cuánto cobrar tu primera web a un negocio local
              </h2>
              <p className="text-sm text-violet-200 leading-relaxed mb-4">
                Una de las preguntas más comunes es cuánto cobrar. La respuesta depende del tipo de negocio, la complejidad de la web y tu experiencia, pero estas son referencias realistas para el mercado hispanohablante:
              </p>
              <div className="rounded-2xl overflow-hidden border border-violet-500/[0.10] mb-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(139,92,246,0.10)" }}>
                      <th className="text-left px-4 py-3 text-violet-300 font-semibold">Tipo de web</th>
                      <th className="text-left px-4 py-3 text-violet-300 font-semibold">Precio orientativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "Landing page básica (Framer, Webflow)", price: "300€ – 600€" },
                      { type: "Web informativa 4–6 páginas", price: "600€ – 1.200€" },
                      { type: "Web con blog o reservas", price: "1.200€ – 2.500€" },
                      { type: "Mantenimiento mensual", price: "50€ – 150€/mes" },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        style={{ borderTop: "1px solid rgba(139,92,246,0.08)", background: i % 2 === 0 ? "rgba(139,92,246,0.02)" : "transparent" }}
                      >
                        <td className="px-4 py-3 text-violet-200">{row.type}</td>
                        <td className="px-4 py-3 text-white font-semibold">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-violet-200 leading-relaxed">
                Con estos precios, <strong className="text-white">una sola venta cubre meses de Huntly</strong>. El plan Go cuesta $9/mes. Si cierras una web a 400€, el plan está pagado más de 40 veces.
              </p>
            </section>

            {/* CTA section */}
            <section
              className="rounded-2xl p-8 md:p-10 text-center border border-violet-500/20"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
            >
              <h2 className="font-black tracking-tighter text-white mb-3" style={{ fontSize: "clamp(18px, 2.5vw, 28px)" }}>
                Empieza a prospectar hoy.
              </h2>
              <p className="text-sm text-violet-200 mb-6 max-w-sm mx-auto">
                3 búsquedas gratis, sin tarjeta. Comprueba cuántos negocios sin web hay en tu ciudad.
              </p>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                  >
                    Buscar negocios sin web — gratis
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all">
                  Ir al dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </section>

          </div>
        </article>

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
              <Link href="/es/para-agencias" className="hover:text-violet-200 transition-colors">Para agencias</Link>
              <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200 transition-colors">Contacto</Link>
            </div>
            <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
