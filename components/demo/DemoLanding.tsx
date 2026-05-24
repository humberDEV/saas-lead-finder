import type { ReactNode } from "react";
import type { DemoBusinessData } from "@/lib/demo/types";
import type { DemoSectionId } from "@/lib/demo/layout";
import {
  Scissors,
  Sparkles,
  User,
  Clock,
  Palette,
  Calendar,
  UtensilsCrossed,
  Coffee,
  Users,
  Package,
  Smile,
  Shield,
  Stethoscope,
  Heart,
  MapPin,
  Hand,
  Sun,
  Flower2,
  Dumbbell,
  Target,
  Apple,
  Scale,
  FileText,
  Phone,
  Pill,
  Wrench,
  Gauge,
  Droplets,
  Car,
  Bed,
  Wifi,
  Star,
  type LucideIcon,
} from "lucide-react";
import { LandingHero } from "./LandingHero";
import { DemoCta } from "./DemoCta";
import { resolveHeroCtaVariant } from "@/lib/demo/cta-layout";
import {
  accentProps,
  cardSurfaceStyle,
  iconWellStyle,
  infoBarStyle,
  isBrandedTheme,
  pageBgStyle,
} from "./demo-theme";

const ICON_MAP: Record<string, LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  user: User,
  clock: Clock,
  palette: Palette,
  calendar: Calendar,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  users: Users,
  package: Package,
  smile: Smile,
  shield: Shield,
  stethoscope: Stethoscope,
  heart: Heart,
  "map-pin": MapPin,
  hand: Hand,
  sun: Sun,
  flower: Flower2,
  dumbbell: Dumbbell,
  target: Target,
  apple: Apple,
  scale: Scale,
  file: FileText,
  phone: Phone,
  pill: Pill,
  wrench: Wrench,
  gauge: Gauge,
  droplet: Droplets,
  car: Car,
  bed: Bed,
  wifi: Wifi,
  star: Star,
};

function ServiceIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? Sparkles;
  return <Icon className="w-5 h-5" strokeWidth={1.75} />;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export function DemoLanding({ data }: { data: DemoBusinessData }) {
  const { theme, locale, cta, layout, sections } = data;
  const branded = isBrandedTheme(theme);
  const accent = accentProps(theme);
  const cleanPhone = data.phone?.replace(/[^0-9+]/g, "") ?? "";
  const waUrl =
    data.hasWhatsapp && data.phone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          locale === "en"
            ? `Hi, I saw your page and I'd like more info about ${data.name}.`
            : `Hola, vi la web de ${data.name} y me gustaría más información.`
        )}`
      : null;

  const showReviews =
    layout.sections.includes("reviews") &&
    data.reviews.length > 0 &&
    layout.maxReviews > 0;

  const heroCtaVariant = resolveHeroCtaVariant(layout.ctaVariant, layout.archetype);
  const heroAlign = layout.archetype === "card" ? "center" : "left";

  const ctaProps = {
    theme,
    cta,
    waUrl,
    cleanPhone,
    phone: data.phone,
    hasWhatsapp: data.hasWhatsapp,
  };

  const t = {
    maps: locale === "en" ? "Open in Google Maps" : "Ver en Google Maps",
    hours: locale === "en" ? "Opening hours" : "Horario",
    badge: locale === "en" ? "Demo created with Huntly" : "Demo creada con Huntly",
    website: locale === "en" ? "Website" : "Web",
    seeAllMaps:
      locale === "en"
        ? `All ${data.reviewCount} reviews on Maps`
        : `Ver las ${data.reviewCount} reseñas en Maps`,
  };

  const sectionBlocks: Record<DemoSectionId, ReactNode> = {
    services: (
      <section key="services" className="max-w-3xl mx-auto px-6 py-14 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          {sections.servicesTitle}
        </h2>
        <p className="text-sm text-zinc-500 mb-8">{sections.servicesSub}</p>
        <div
          className={
            layout.archetype === "bento"
              ? "grid gap-3"
              : "grid sm:grid-cols-2 gap-4"
          }
        >
          {data.services.map((service) => (
            <div
              key={service.title}
              className={`rounded-2xl border p-5 ${branded ? "" : `bg-white/[0.03] ${theme.accentBorder}`}`}
              style={cardSurfaceStyle(theme)}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${branded ? "" : `bg-white/[0.06] ${accent.className}`}`}
                style={iconWellStyle(theme) ?? accent.style}
              >
                <ServiceIcon name={service.icon} />
              </div>
              <h3 className="font-semibold text-white mb-1">{service.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    ),

    reviews: showReviews ? (
      <section
        key="reviews"
        className={`max-w-3xl mx-auto px-6 py-14 md:py-16 border-t border-white/[0.04] ${
          layout.archetype === "editorial" ? "bg-white/[0.01]" : ""
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          {sections.reviewsTitle}
        </h2>
        <div className={data.reviews.length > 1 ? "grid md:grid-cols-2 gap-4" : "max-w-xl"}>
          {data.reviews.map((review, i) => (
            <article
              key={`${review.author}-${i}`}
              className={`rounded-2xl border p-5 ${branded ? "" : `bg-white/[0.03] ${theme.accentBorder}`}`}
              style={cardSurfaceStyle(theme)}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-sm text-white truncate">{review.author}</p>
                <span className="text-amber-400 text-xs tabular-nums">{review.rating}★</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{truncate(review.text, 180)}</p>
              {review.timeAgo && (
                <p className="text-[11px] text-zinc-600 mt-2">{review.timeAgo}</p>
              )}
            </article>
          ))}
        </div>
        {data.reviewCount > data.reviews.length && (
          <p className="mt-5 text-center">
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium hover:underline ${accent.className}`}
              style={accent.style}
            >
              {t.seeAllMaps} →
            </a>
          </p>
        )}
      </section>
    ) : null,

    location: (
      <section
        key="location"
        className="max-w-3xl mx-auto px-6 py-14 md:py-16 border-t border-white/[0.04]"
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          {sections.locationTitle}
        </h2>
        <div
          className={`rounded-2xl border p-6 md:p-8 space-y-5 ${branded ? "" : "border-white/10 bg-white/[0.02]"}`}
          style={cardSurfaceStyle(theme)}
        >
          <p className="font-medium text-zinc-100 leading-snug">{data.address}</p>
          {data.city && <p className="text-sm text-zinc-500">{data.city}</p>}
          {data.openingHours && data.openingHours.length > 0 && (
            <ul className="space-y-1 text-sm text-zinc-400 border-t border-white/[0.06] pt-4">
              {data.openingHours.slice(0, 7).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <a
            href={data.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-semibold ${accent.className}`}
            style={accent.style}
          >
            <MapPin className="w-4 h-4" />
            {t.maps}
          </a>
        </div>
      </section>
    ),
  };

  function FooterCta() {
    if (layout.ctaVariant === "floating-bar") {
      return (
        <section className="max-w-3xl mx-auto px-6 pb-28 pt-6 text-center md:pb-24">
          <h2 className="text-xl font-bold mb-2">{cta.footerTitle}</h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">{cta.footerSub}</p>
          <div className="hidden md:flex justify-center">
            <DemoCta variant="dual-pill" placement="footer" align="center" {...ctaProps} />
          </div>
        </section>
      );
    }

    if (layout.ctaVariant === "card-panel") {
      return (
        <section className="max-w-3xl mx-auto px-6 pb-24 pt-6">
          <div
            className={`rounded-3xl border p-10 text-center ${branded ? "" : `bg-gradient-to-br ${theme.ctaPanel} ${theme.accentBorder}`}`}
            style={
              branded
                ? { background: theme.ctaPanel, borderColor: `${theme.brand!.primary}40` }
                : undefined
            }
          >
            <h2 className="text-2xl font-bold mb-2">{cta.footerTitle}</h2>
            <p className="text-sm text-zinc-400 mb-8">{cta.footerSub}</p>
            <div className="flex justify-center w-full">
              <DemoCta variant="card-panel" placement="footer" align="center" {...ctaProps} />
            </div>
          </div>
        </section>
      );
    }

    if (layout.ctaVariant === "stack-full") {
      return (
        <section className="max-w-3xl mx-auto px-6 pb-24 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{cta.footerTitle}</h2>
            <p className="text-sm text-zinc-400">{cta.footerSub}</p>
          </div>
          <div className="flex justify-center">
            <DemoCta variant="stack-full" placement="footer" align="center" {...ctaProps} />
          </div>
        </section>
      );
    }

    if (layout.ctaVariant === "minimal-row") {
      return (
        <section className="max-w-3xl mx-auto px-6 pb-24 pt-10 border-t border-white/[0.06]">
          <h2 className="text-xl font-bold mb-2">{cta.footerTitle}</h2>
          <p className="text-sm text-zinc-500 mb-6">{cta.footerSub}</p>
          <DemoCta variant="minimal-row" placement="footer" {...ctaProps} />
        </section>
      );
    }

    return (
      <section className="max-w-3xl mx-auto px-6 pb-24 pt-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{cta.footerTitle}</h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">{cta.footerSub}</p>
        <DemoCta variant="dual-pill" placement="footer" align="center" {...ctaProps} />
      </section>
    );
  }

  return (
    <div
      className={`min-h-screen text-white antialiased ${layout.stickyMobileCta ? "pb-24 md:pb-0" : ""}`}
      style={pageBgStyle(theme)}
    >
      <LandingHero
        data={data}
        archetype={layout.archetype}
        waUrl={waUrl}
        cleanPhone={cleanPhone}
        ctaSlot={
          <DemoCta
            variant={heroCtaVariant}
            placement="hero"
            align={heroAlign}
            {...ctaProps}
          />
        }
      />

      {layout.archetype !== "minimal" && (data.cityShort || data.phone) && (
        <div
          className={`border-b ${branded ? "" : "border-white/[0.06] bg-white/[0.02]"}`}
          style={infoBarStyle(theme)}
        >
          <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap gap-6 text-sm text-zinc-500">
            {data.cityShort && (
              <span className="inline-flex items-center gap-2">
                <MapPin className={`w-3.5 h-3.5 ${accent.className}`} style={accent.style} />
                {data.cityShort}
              </span>
            )}
            {data.phone && (
              <a href={`tel:${cleanPhone}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className={`w-3.5 h-3.5 ${accent.className}`} style={accent.style} />
                {data.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {layout.sections.map((id) => sectionBlocks[id])}

      <FooterCta />

      {layout.stickyMobileCta && (
        <DemoCta variant="floating-bar" placement="sticky" {...ctaProps} />
      )}

      <footer className="pb-8 text-center">
        <a
          href="https://tryhuntly.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-600 hover:text-zinc-400"
        >
          {t.badge}
        </a>
      </footer>
    </div>
  );
}
