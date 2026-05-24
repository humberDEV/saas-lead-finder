import { buildBrandedTheme } from "./brand-colors";
import { buildHeroSubtitle, buildServices, buildCtaCopy, buildSectionCopy } from "./copy";
import { resolveLandingLayout } from "./layout";
import { extractCityShort, extractCountry, inferLocale, buildMapsUrl } from "./geo";
import { inferCategory } from "./infer-category";
import { enrichLeadFromPlaceDetails } from "./places-details";
import type { DemoBusinessData, DemoLeadInput } from "./types";

export async function buildDemoFromLead(
  input: DemoLeadInput
): Promise<{ template: string; businessData: DemoBusinessData }> {
  const category = inferCategory(input.niche ?? "");
  const cityShort = extractCityShort(input.city, input.address);
  const country = input.country ?? extractCountry(input.city);
  const locale = input.locale ?? inferLocale(input.city, country);
  const cityFull = input.city?.trim() || null;

  const { enrichment, photoUrls } = await enrichLeadFromPlaceDetails(
    input.placeId,
    locale,
    input.photoNames
  );

  const rating = enrichment?.rating ?? input.rating ?? 0;
  const reviewCount = enrichment?.reviewCount ?? input.reviewCount ?? 0;
  const phone = enrichment?.phone ?? input.phone ?? null;
  const website = enrichment?.website ?? input.website ?? null;
  const googleMapsUri = enrichment?.googleMapsUri ?? input.googleMapsUri ?? null;
  const openingHours = enrichment?.openingHours ?? input.openingHours ?? null;
  const layout = resolveLandingLayout(
    category,
    input.name,
    photoUrls.length > 0
  );
  const reviews = (enrichment?.reviews ?? []).slice(0, layout.maxReviews);

  const mapsUrl = buildMapsUrl(
    input.name,
    input.address,
    googleMapsUri ?? input.googleMapsUri,
    input.placeId
  );

  const ctx = {
    name: input.name,
    cityShort,
    cityFull,
    rating,
    reviewCount,
    niche: input.niche ?? null,
    locale,
  };

  const themeSeed = `${input.name}|${input.niche ?? ""}|${input.address}`;
  const theme = await buildBrandedTheme(
    category,
    photoUrls,
    enrichment?.iconBackgroundColor,
    themeSeed,
    input.niche ?? null
  );
  const heroSubtitle = buildHeroSubtitle(category, ctx);
  const services = buildServices(category, locale);
  const cta = buildCtaCopy(category, input.name, locale);
  const sections = buildSectionCopy(category, locale);

  const businessData: DemoBusinessData = {
    name: input.name,
    niche: input.niche ?? null,
    city: cityFull,
    cityShort,
    address: input.address,
    phone,
    rating,
    reviewCount,
    hasWhatsapp: input.hasWhatsapp ?? false,
    website,
    mapsUrl: input.mapsUrl ?? mapsUrl,
    googleMapsUri,
    photos: photoUrls,
    heroImage: photoUrls[0] ?? null,
    openingHours,
    locale,
    country,
    category,
    heroSubtitle,
    services,
    theme,
    reviews,
    cta,
    layout,
    sections,
  };

  return { template: category, businessData };
}
