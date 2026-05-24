export type { DemoLayoutConfig, LandingArchetype, CtaVariant, DemoSectionId } from "./layout";
import type { DemoLayoutConfig } from "./layout";

export type DemoLocale = "es" | "en";

export type DemoCategory =
  | "barberia"
  | "peluqueria"
  | "restaurante"
  | "dentista"
  | "clinica"
  | "estetica"
  | "gimnasio"
  | "abogado"
  | "veterinaria"
  | "taller"
  | "hotel"
  | "general";

export interface DemoServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface DemoBrandColors {
  primary: string;
  secondary: string;
  deep: string;
  source: "photo" | "google_icon" | "category" | "niche";
}

export interface DemoTheme {
  /** Colores extraídos de foto Google / icono Maps */
  brand?: DemoBrandColors;
  /** Tailwind classes o CSS gradient si hay brand */
  heroGradient: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  glow: string;
  label: string;
  emoji: string;
  heroGlow: string;
  ctaPrimary: string;
  ctaPrimaryHover: string;
  ctaPanel: string;
  ctaOutline: string;
}

export interface DemoReview {
  author: string;
  rating: number;
  text: string;
  timeAgo: string | null;
}

export interface DemoSectionCopy {
  servicesTitle: string;
  servicesSub: string;
  reviewsTitle: string;
  locationTitle: string;
}

export interface DemoCtaCopy {
  waHero: string;
  waFooter: string;
  callHero: string;
  callFooter: string;
  footerTitle: string;
  footerSub: string;
}

export interface DemoBusinessData {
  name: string;
  niche: string | null;
  city: string | null;
  cityShort: string;
  address: string;
  phone: string | null;
  rating: number;
  reviewCount: number;
  hasWhatsapp: boolean;
  website: string | null;
  mapsUrl: string;
  googleMapsUri: string | null;
  photos: string[];
  heroImage: string | null;
  openingHours: string[] | null;
  locale: DemoLocale;
  country: string | null;
  category: DemoCategory;
  heroSubtitle: string;
  services: DemoServiceItem[];
  theme: DemoTheme;
  reviews: DemoReview[];
  cta: DemoCtaCopy;
  layout: DemoLayoutConfig;
  sections: DemoSectionCopy;
}

/** Payload accepted when creating a demo from a lead */
export interface DemoLeadInput {
  name: string;
  address: string;
  phone?: string | null;
  rating?: number;
  reviewCount?: number;
  city?: string | null;
  niche?: string | null;
  hasWhatsapp?: boolean;
  website?: string | null;
  mapsUrl?: string | null;
  googleMapsUri?: string | null;
  placeId?: string | null;
  photoNames?: string[];
  openingHours?: string[] | null;
  locale?: DemoLocale;
  country?: string | null;
}
