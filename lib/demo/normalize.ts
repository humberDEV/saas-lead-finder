import { CATEGORY_THEMES } from "./categories";
import { syncBrandedTheme } from "./brand-colors";
import { buildHeroSubtitle, buildServices, buildCtaCopy, buildSectionCopy } from "./copy";
import { resolveLandingLayout } from "./layout";
import { dedupeReviews } from "./places-details";
import { extractCityShort, inferLocale, buildMapsUrl } from "./geo";
import type { DemoBusinessData, DemoCategory, DemoReview } from "./types";

function patchTheme(
  category: DemoCategory,
  name: string,
  niche: string | null,
  address: string,
  existing?: DemoBusinessData["theme"]
): DemoBusinessData["theme"] {
  const seed = `${name}|${niche ?? ""}|${address}`;
  return syncBrandedTheme(category, seed, niche, existing);
}

/** Ensures old demos stored before the redesign still render */
export function normalizeBusinessData(
  raw: Record<string, unknown>,
  template: string
): DemoBusinessData {
  const category = (
    (raw.category as string) in CATEGORY_THEMES ? raw.category : template in CATEGORY_THEMES ? template : "general"
  ) as DemoCategory;

  const city = (raw.city as string) ?? null;
  const cityShort =
    (raw.cityShort as string) || extractCityShort(city, raw.address as string);
  const locale = (raw.locale as "es" | "en") ?? inferLocale(city);
  const name = raw.name as string;
  const rating = Number(raw.rating) || 0;
  const reviewCount = Number(raw.reviewCount) || 0;

  const ctx = {
    name,
    cityShort,
    cityFull: city,
    rating,
    reviewCount,
    niche: (raw.niche as string) ?? null,
    locale,
  };

  const theme = patchTheme(
    category,
    name,
    (raw.niche as string) ?? null,
    raw.address as string,
    raw.theme as DemoBusinessData["theme"]
  );
  const hasPhoto = Boolean(
    raw.heroImage || (Array.isArray(raw.photos) && (raw.photos as string[]).length > 0)
  );
  const layout = resolveLandingLayout(category, name, hasPhoto);
  const reviews = dedupeReviews(
    (raw.reviews as DemoReview[]) ?? [],
    layout.maxReviews
  );
  const cta =
    (raw.cta as DemoBusinessData["cta"]) ?? buildCtaCopy(category, name, locale);
  const sections = buildSectionCopy(category, locale);

  return {
    name,
    niche: (raw.niche as string) ?? null,
    city,
    cityShort,
    address: raw.address as string,
    phone: (raw.phone as string) ?? null,
    rating,
    reviewCount,
    hasWhatsapp: Boolean(raw.hasWhatsapp),
    website: (raw.website as string) ?? null,
    mapsUrl:
      (raw.mapsUrl as string) ?? buildMapsUrl(name, raw.address as string),
    googleMapsUri: (raw.googleMapsUri as string) ?? null,
    photos: (raw.photos as string[]) ?? [],
    heroImage: (raw.heroImage as string) ?? null,
    openingHours: (raw.openingHours as string[]) ?? null,
    locale,
    country: (raw.country as string) ?? null,
    category,
    heroSubtitle: buildHeroSubtitle(category, ctx),
    services:
      (raw.services as DemoBusinessData["services"]) ??
      buildServices(category, locale),
    theme,
    reviews,
    cta,
    layout,
    sections,
  };
}
