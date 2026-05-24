import type { ReactNode } from "react";
import type { DemoBusinessData } from "@/lib/demo/types";
import type { LandingArchetype } from "@/lib/demo/layout";
import { DemoCta } from "./DemoCta";
import {
  accentProps,
  ambientBrandLayers,
  heroBgStyle,
  heroGlowStyle,
  isBrandedTheme,
} from "./demo-theme";

function BrandAmbient({ theme }: { theme: DemoBusinessData["theme"] }) {
  const layers = ambientBrandLayers(theme);
  if (layers.length === 0) return null;
  return (
    <>
      {layers.map((style, i) => (
        <div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={style}
          aria-hidden
        />
      ))}
    </>
  );
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex gap-0.5 text-sm" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? "text-amber-400" : "text-white/15"}>
          ★
        </span>
      ))}
    </div>
  );
}

function GoogleBadge({ data }: { data: DemoBusinessData }) {
  if (data.rating <= 0) return null;
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
      <Stars rating={data.rating} />
      <span className="text-sm font-semibold tabular-nums">{data.rating.toFixed(1)}</span>
      {data.reviewCount > 0 && (
        <span className="text-xs text-zinc-500">
          · {data.reviewCount} {data.locale === "en" ? "on Google" : "en Google"}
        </span>
      )}
    </div>
  );
}

export interface HeroProps {
  data: DemoBusinessData;
  archetype: LandingArchetype;
  waUrl: string | null;
  cleanPhone: string;
}

function HeroCopy({
  data,
  children,
  align = "left",
}: {
  data: DemoBusinessData;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  const { theme } = data;
  const accent = accentProps(theme);
  const alignCls = align === "center" ? "text-center items-center" : "text-left";

  return (
    <div className={`flex flex-col ${alignCls}`}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 ${accent.className}`}
        style={accent.style}
      >
        <span>{theme.emoji}</span>
        {theme.label}
        {data.cityShort ? (
          <span className="text-white/40 font-normal normal-case tracking-normal">
            · {data.cityShort}
          </span>
        ) : null}
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-white mb-3">
        {data.name}
      </h1>
      <p className="text-base sm:text-lg text-zinc-300/90 max-w-xl leading-relaxed mb-5">
        {data.heroSubtitle}
      </p>
      <GoogleBadge data={data} />
      {children ? (
        <div
          className={`mt-8 w-full max-w-full ${
            align === "center" ? "flex flex-col items-stretch sm:items-center" : ""
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Foto pantalla completa */
function SpotlightHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-end overflow-hidden">
      {data.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className={branded ? "absolute inset-0" : `absolute inset-0 bg-gradient-to-br ${t.heroGradient}`}
          style={heroBgStyle(t, branded)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/80 to-black/25" />
      <div
        className={branded ? "absolute inset-0" : `absolute inset-0 ${t.heroGlow}`}
        style={heroGlowStyle(t, branded)}
      />
      <div className="relative z-10 max-w-3xl mx-auto w-full px-6 pb-14 pt-28">{children}</div>
    </section>
  );
}

/** 50/50 en desktop */
function SplitHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="relative min-h-0 md:min-h-[85vh] overflow-hidden border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:min-h-[85vh]">
        <div className="relative flex flex-col justify-center px-6 py-14 md:py-20 md:pr-10 order-2 md:order-1 overflow-hidden">
          <BrandAmbient theme={t} />
          <div className="relative">{children}</div>
        </div>
        <div className="relative min-h-[42vh] md:min-h-full order-1 md:order-2">
          {data.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div
              className={branded ? "absolute inset-0" : `absolute inset-0 bg-gradient-to-bl ${t.heroGradient}`}
              style={heroBgStyle(t, branded)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#07070a] via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}

/** Título primero, foto mediana redondeada */
function EditorialHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="border-b border-white/[0.06]">
      <div
        className={branded ? "" : `bg-gradient-to-b ${t.heroGradient}`}
        style={branded ? { background: `linear-gradient(180deg, ${data.theme.brand?.deep ?? "#07070a"} 0%, #07070a 100%)` } : heroBgStyle(t, branded)}
      >
        <div className="max-w-3xl mx-auto px-6 pt-14 pb-8">{children}</div>
      </div>
      {data.heroImage && (
        <div className="max-w-3xl mx-auto px-6 -mt-2 pb-10">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.heroImage} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </section>
  );
}

/** Sin foto grande — banda de marca */
function MinimalHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="border-b border-white/[0.06] relative overflow-hidden">
      <div
        className={branded ? "relative py-14 md:py-20" : `relative py-14 md:py-20 bg-gradient-to-br ${t.heroGradient}`}
        style={heroBgStyle(t, branded)}
      >
        {branded ? (
          <BrandAmbient theme={t} />
        ) : (
          <div
            className={`absolute inset-0 ${t.heroGlow}`}
            style={heroGlowStyle(t, branded)}
          />
        )}
        <div className="relative max-w-3xl mx-auto px-6">{children}</div>
      </div>
    </section>
  );
}

/** Tarjeta glass centrada */
function CardHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div
        className={branded ? "absolute inset-0" : `absolute inset-0 bg-gradient-to-br ${t.heroGradient}`}
        style={heroBgStyle(t, branded)}
      />
      <div className="absolute inset-0 bg-[#07070a]/50" />
      <div className="relative max-w-xl mx-auto px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          {data.heroImage && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/15 mb-6 mx-auto md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Asimétrico: copy + CTA arriba, foto grande abajo a la derecha */
function BentoHero({ data, children }: HeroProps & { children: ReactNode }) {
  const branded = isBrandedTheme(data.theme);
  const t = data.theme;
  return (
    <section className="relative border-b border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative">
        <BrandAmbient theme={t} />
        <div className="relative grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-5">{children}</div>
          <div className="lg:col-span-7">
            {data.heroImage ? (
              <div className="rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] lg:aspect-[16/11] shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.heroImage} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className={branded ? "rounded-3xl aspect-[4/3]" : `rounded-3xl aspect-[4/3] bg-gradient-to-br ${t.heroGradient}`}
                style={heroBgStyle(t, branded)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingHero(props: HeroProps & { ctaSlot: ReactNode }) {
  const { data, archetype, ctaSlot } = props;
  const heroAlign = archetype === "card" ? "center" : "left";
  const inner = (
    <HeroCopy data={data} align={heroAlign}>
      {ctaSlot}
    </HeroCopy>
  );

  switch (archetype) {
    case "split":
      return <SplitHero {...props}>{inner}</SplitHero>;
    case "editorial":
      return <EditorialHero {...props}>{inner}</EditorialHero>;
    case "minimal":
      return <MinimalHero {...props}>{inner}</MinimalHero>;
    case "card":
      return <CardHero {...props}>{inner}</CardHero>;
    case "bento":
      return <BentoHero {...props}>{inner}</BentoHero>;
    case "spotlight":
    default:
      return <SpotlightHero {...props}>{inner}</SpotlightHero>;
  }
}
