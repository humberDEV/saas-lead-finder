import type { DemoCategory } from "./types";

export type DemoSectionId = "services" | "reviews" | "location";

/** Formato visual de la landing — cada uno se siente distinto */
export type LandingArchetype =
  | "spotlight" /** Foto a pantalla completa, texto abajo */
  | "split" /** Mitad texto / mitad foto */
  | "editorial" /** Tipografía grande, foto mediana debajo del título */
  | "minimal" /** Sin foto hero: banda de color + contenido directo */
  | "card" /** Tarjeta glass flotante + miniatura */
  | "bento"; /** Grid asimétrico: copy arriba-izq, foto abajo-dcha */

/** Diseño de botones de contacto */
export type CtaVariant =
  | "dual-pill"
  | "stack-full"
  | "floating-bar"
  | "card-panel"
  | "minimal-row";

export interface DemoLayoutConfig {
  archetype: LandingArchetype;
  ctaVariant: CtaVariant;
  sections: DemoSectionId[];
  maxReviews: number;
  /** Barra fija inferior en móvil */
  stickyMobileCta: boolean;
}

function hashKey(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const ARCHETYPE_POOLS: Record<DemoCategory, LandingArchetype[]> = {
  restaurante: ["split", "spotlight", "bento", "editorial", "card"],
  barberia: ["card", "minimal", "split", "editorial", "spotlight"],
  peluqueria: ["split", "card", "editorial", "spotlight", "bento"],
  dentista: ["minimal", "editorial", "card", "split", "spotlight"],
  clinica: ["editorial", "minimal", "card", "split"],
  estetica: ["split", "card", "bento", "editorial", "spotlight"],
  gimnasio: ["bento", "minimal", "split", "spotlight"],
  abogado: ["minimal", "editorial", "card"],
  veterinaria: ["spotlight", "split", "card", "editorial"],
  taller: ["minimal", "card", "split", "editorial"],
  hotel: ["spotlight", "split", "bento", "card"],
  general: ["spotlight", "editorial", "split", "minimal", "card", "bento"],
};

const CTA_POOL: CtaVariant[] = [
  "dual-pill",
  "stack-full",
  "card-panel",
  "minimal-row",
  "floating-bar",
];

const SECTION_POOLS: Record<DemoCategory, DemoSectionId[][]> = {
  restaurante: [
    ["services", "reviews", "location"],
    ["reviews", "services", "location"],
  ],
  barberia: [
    ["services", "location", "reviews"],
    ["location", "services", "reviews"],
  ],
  peluqueria: [
    ["services", "reviews", "location"],
    ["reviews", "services", "location"],
  ],
  dentista: [
    ["services", "reviews", "location"],
    ["services", "location", "reviews"],
  ],
  clinica: [
    ["services", "location", "reviews"],
    ["location", "services"],
  ],
  estetica: [
    ["services", "reviews", "location"],
    ["reviews", "services", "location"],
  ],
  gimnasio: [
    ["services", "location", "reviews"],
    ["location", "services", "reviews"],
  ],
  abogado: [["services", "location"], ["location", "services"]],
  veterinaria: [
    ["services", "reviews", "location"],
    ["reviews", "services", "location"],
  ],
  taller: [
    ["location", "services", "reviews"],
    ["services", "location", "reviews"],
  ],
  hotel: [
    ["services", "location", "reviews"],
    ["location", "services", "reviews"],
  ],
  general: [
    ["services", "location", "reviews"],
    ["services", "reviews", "location"],
    ["location", "services", "reviews"],
  ],
};

const MAX_REVIEWS: Record<DemoCategory, number> = {
  barberia: 2,
  peluqueria: 2,
  restaurante: 2,
  dentista: 2,
  clinica: 2,
  estetica: 2,
  gimnasio: 2,
  abogado: 0,
  veterinaria: 2,
  taller: 2,
  hotel: 2,
  general: 2,
};

const PHOTO_HEAVY: LandingArchetype[] = ["spotlight", "split", "bento"];

function fallbackArchetype(hasPhoto: boolean): LandingArchetype {
  return hasPhoto ? "editorial" : "minimal";
}

/**
 * Elige formato + CTA de forma estable por negocio (mismo nombre = misma plantilla).
 * No es random: es determinista para que el link sea reproducible.
 */
export function resolveLandingLayout(
  category: DemoCategory,
  businessName: string,
  hasPhoto: boolean
): DemoLayoutConfig {
  const key = `${category}:${businessName.trim().toLowerCase()}`;
  const h = hashKey(key);

  const archetypes = ARCHETYPE_POOLS[category] ?? ARCHETYPE_POOLS.general;
  let archetype = archetypes[h % archetypes.length];

  if (!hasPhoto && PHOTO_HEAVY.includes(archetype)) {
    archetype = fallbackArchetype(false);
  }

  const ctaVariant = CTA_POOL[h % CTA_POOL.length];
  const sectionOptions = SECTION_POOLS[category] ?? SECTION_POOLS.general;
  const sections = sectionOptions[h % sectionOptions.length];

  return {
    archetype,
    ctaVariant,
    sections,
    maxReviews: MAX_REVIEWS[category] ?? 2,
    stickyMobileCta: ctaVariant === "floating-bar",
  };
}

/** @deprecated use resolveLandingLayout */
export function getCategoryLayout(category: DemoCategory): DemoLayoutConfig {
  return resolveLandingLayout(category, category, false);
}
