import "server-only";
import { Vibrant } from "node-vibrant/node";
import { getCategoryTheme } from "./categories";
import {
  adjustHex,
  hashString,
  isTooDark,
  isTooLight,
  normalizeHex,
  pickReadableAccent,
  seedToneOffset,
} from "./color-utils";
import type { DemoBusinessData, DemoCategory, DemoTheme } from "./types";

export type BrandColorSource = "photo" | "google_icon" | "category" | "niche";

export interface DemoBrandColors {
  primary: string;
  secondary: string;
  deep: string;
  source: BrandColorSource;
}

type Swatch = { hex?: string } | null | undefined;

function pickFromPalette(palette: Record<string, Swatch>): {
  primary: string;
  secondary: string;
  deep: string;
} | null {
  const vibrant = palette.Vibrant?.hex;
  const dark = palette.DarkVibrant?.hex ?? palette.DarkMuted?.hex;
  const muted = palette.Muted?.hex ?? palette.LightMuted?.hex;
  const light = palette.LightVibrant?.hex;

  let primary = vibrant ?? dark ?? muted;
  if (!primary) return null;

  if (isTooLight(primary)) primary = dark ?? adjustHex(primary, -0.3);
  if (isTooDark(primary)) primary = vibrant ?? light ?? adjustHex(primary, 0.2);

  primary = pickReadableAccent(primary);

  let secondary = muted ?? light ?? adjustHex(primary, 0.15);
  if (secondary === primary) secondary = adjustHex(primary, -0.2);

  const deep = dark ?? adjustHex(primary, -0.45);

  return {
    primary: normalizeHex(primary)!,
    secondary: normalizeHex(secondary)!,
    deep: normalizeHex(deep)!,
  };
}

const EXTRACT_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

/** Extrae paleta dominante de una URL de imagen (foto Google, etc.) */
export async function extractBrandFromImageUrl(
  imageUrl: string
): Promise<DemoBrandColors | null> {
  try {
    const palette = await withTimeout(
      Vibrant.from(imageUrl).getPalette(),
      EXTRACT_TIMEOUT_MS
    );
    if (!palette) return null;

    const colors = pickFromPalette(palette as unknown as Record<string, Swatch>);
    if (!colors) return null;

    return { ...colors, source: "photo" };
  } catch (e) {
    console.warn("[demo] Vibrant extract failed:", e);
    return null;
  }
}

/** Color de icono de categoría en Google (aproximación si no hay foto útil) */
export function brandFromGoogleIconColor(hex: string): DemoBrandColors | null {
  const primary = normalizeHex(hex);
  if (!primary || isTooLight(primary)) return null;

  return {
    primary: pickReadableAccent(primary),
    secondary: adjustHex(primary, 0.18),
    deep: adjustHex(primary, -0.42),
    source: "google_icon",
  };
}

const CATEGORY_PRIMARY: Record<DemoCategory, string> = {
  barberia: "#d97706",
  peluqueria: "#f43f5e",
  restaurante: "#ea580c",
  dentista: "#06b6d4",
  clinica: "#0ea5e9",
  estetica: "#a855f7",
  gimnasio: "#10b981",
  abogado: "#6366f1",
  veterinaria: "#14b8a6",
  taller: "#d97706",
  hotel: "#8b5cf6",
  general: "#8b5cf6",
};

/** Paleta por palabras del nicho cuando la categoría es "general" */
function nichePrimaryOverride(niche: string | null | undefined): string | null {
  if (!niche?.trim()) return null;
  const n = niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/electric|elecric|instalac.*electric/i.test(n)) return "#2563eb";
  if (/fontan|plomer|fugas/i.test(n)) return "#0891b2";
  if (/cerraj|llav/i.test(n)) return "#ca8a04";
  if (/pintor|pintura/i.test(n)) return "#7c3aed";
  if (/limpieza|cleaning/i.test(n)) return "#14b8a6";
  if (/carpinter|muebl/i.test(n)) return "#b45309";
  if (/jardin|paisaj/i.test(n)) return "#16a34a";
  if (/seguridad|alarm/i.test(n)) return "#475569";
  if (/fotograf|video/i.test(n)) return "#db2777";
  if (/inmobiliar|reformas|construc/i.test(n)) return "#64748b";

  return null;
}

function categoryFallbackPrimary(category: DemoCategory, niche?: string | null): string {
  const fromNiche = nichePrimaryOverride(niche);
  if (fromNiche) return fromNiche;
  return CATEGORY_PRIMARY[category] ?? CATEGORY_PRIMARY.general;
}

/** Variación sutil para que dos negocios del mismo rubro no sean idénticos */
export function varyBrandBySeed(brand: DemoBrandColors, seed: string): DemoBrandColors {
  const offset = seedToneOffset(seed, 0.2);
  const primary = pickReadableAccent(adjustHex(brand.primary, offset));
  const secondary = adjustHex(brand.secondary, offset * 0.85);
  const deep = adjustHex(brand.deep, offset * 0.5);
  return {
    ...brand,
    primary: normalizeHex(primary) ?? brand.primary,
    secondary: normalizeHex(secondary) ?? brand.secondary,
    deep: normalizeHex(deep) ?? brand.deep,
  };
}

export function brandFromCategory(
  category: DemoCategory,
  seed: string,
  niche?: string | null
): DemoBrandColors {
  const base = categoryFallbackPrimary(category, niche);
  const primary = pickReadableAccent(adjustHex(base, seedToneOffset(seed, 0.12)));
  const source: BrandColorSource = nichePrimaryOverride(niche) ? "niche" : "category";
  return {
    primary,
    secondary: adjustHex(primary, 0.14),
    deep: adjustHex(primary, -0.42),
    source,
  };
}

/**
 * Intenta: 1ª foto → 2ª foto → color icono Google → paleta categoría/nicho + seed
 */
export async function resolveBrandColors(
  category: DemoCategory,
  photoUrls: string[],
  iconBackgroundColor?: string | null,
  seed = "",
  niche?: string | null
): Promise<DemoBrandColors> {
  for (const url of photoUrls.slice(0, 2)) {
    const fromPhoto = await extractBrandFromImageUrl(url);
    if (fromPhoto) {
      return seed ? varyBrandBySeed(fromPhoto, seed) : fromPhoto;
    }
  }

  if (iconBackgroundColor) {
    const fromIcon = brandFromGoogleIconColor(iconBackgroundColor);
    if (fromIcon) {
      return seed ? varyBrandBySeed(fromIcon, seed) : fromIcon;
    }
  }

  return varyBrandBySeed(brandFromCategory(category, seed, niche), seed || category);
}

/** Fusiona colores de marca en el tema (siempre con CSS inline visible) */
export function applyBrandToTheme(base: DemoTheme, brand: DemoBrandColors): DemoTheme {
  const { primary, secondary, deep } = brand;
  const accent = pickReadableAccent(primary);

  return {
    ...base,
    brand,
    heroGradient: `linear-gradient(145deg, ${deep} 0%, ${primary}55 42%, #07070a 100%)`,
    heroGlow: `radial-gradient(ellipse 90% 60% at 50% -15%, ${primary}33, transparent 65%)`,
    accentText: accent,
    accentBg: primary,
    accentBorder: `${primary}4d`,
    glow: `0 8px 32px ${primary}40`,
    ctaPrimary: `linear-gradient(90deg, ${primary}, ${secondary})`,
    ctaPrimaryHover: `linear-gradient(90deg, ${adjustHex(primary, 0.08)}, ${adjustHex(secondary, 0.08)})`,
    ctaPanel: `linear-gradient(160deg, ${primary}28 0%, ${secondary}10 40%, #07070a 100%)`,
    ctaOutline: `1px solid ${primary}66`,
  };
}

export async function buildBrandedTheme(
  category: DemoCategory,
  photoUrls: string[],
  iconBackgroundColor?: string | null,
  seed = "",
  niche?: string | null
): Promise<DemoTheme> {
  const base = getCategoryTheme(category);
  const brand = await resolveBrandColors(
    category,
    photoUrls,
    iconBackgroundColor,
    seed,
    niche
  );
  return applyBrandToTheme(base, brand);
}

/** Tema con marca en servidor (normalize, demos sin re-extracción) */
export function syncBrandedTheme(
  category: DemoCategory,
  seed: string,
  niche?: string | null,
  existing?: DemoTheme
): DemoTheme {
  const base = getCategoryTheme(category);
  const preserved =
    existing?.brand &&
    (existing.brand.source === "photo" || existing.brand.source === "google_icon");

  const brand = preserved
    ? varyBrandBySeed(existing!.brand!, seed)
    : varyBrandBySeed(brandFromCategory(category, seed, niche), seed);

  return applyBrandToTheme(base, brand);
}

/** Re-extrae color de fotos guardadas si el tema viejo no tenía marca */
export async function rehydrateDemoTheme(
  data: DemoBusinessData
): Promise<DemoBusinessData> {
  const seed = `${data.name}|${data.niche ?? ""}|${hashString(data.address)}`;
  const hasPhotoBrand =
    data.theme.brand?.source === "photo" || data.theme.brand?.source === "google_icon";

  if (hasPhotoBrand) {
    return {
      ...data,
      theme: syncBrandedTheme(data.category, seed, data.niche, data.theme),
    };
  }

  const urls = data.photos?.length ? data.photos : data.heroImage ? [data.heroImage] : [];
  if (urls.length > 0) {
    const brand = await resolveBrandColors(data.category, urls, null, seed, data.niche);
    return {
      ...data,
      theme: applyBrandToTheme(getCategoryTheme(data.category), brand),
    };
  }

  return {
    ...data,
    theme: syncBrandedTheme(data.category, seed, data.niche, data.theme),
  };
}
