import type { DemoLocale } from "./types";

const COUNTRY_LOCALE: Record<string, DemoLocale> = {
  spain: "es",
  españa: "es",
  mexico: "es",
  méxico: "es",
  argentina: "es",
  colombia: "es",
  chile: "es",
  peru: "es",
  perú: "es",
  ecuador: "es",
  uruguay: "es",
  paraguay: "es",
  bolivia: "es",
  venezuela: "es",
  "costa rica": "es",
  panama: "es",
  panamá: "es",
  "united states": "en",
  usa: "en",
  "united kingdom": "en",
  uk: "en",
};

/** First segment of "City, Country" */
export function extractCityShort(city?: string | null, address?: string): string {
  if (city?.trim()) {
    const part = city.split(",")[0]?.trim();
    if (part) return part;
  }
  if (address) {
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2] ?? parts[0];
    if (parts[0]) return parts[0];
  }
  return "";
}

export function extractCountry(city?: string | null): string | null {
  if (!city?.includes(",")) return null;
  const segment = city.split(",").pop()?.trim();
  return segment || null;
}

export function inferLocale(city?: string | null, country?: string | null): DemoLocale {
  const c = (country ?? extractCountry(city) ?? "").toLowerCase();
  for (const [key, loc] of Object.entries(COUNTRY_LOCALE)) {
    if (c.includes(key)) return loc;
  }
  return "es";
}

export function buildMapsUrl(
  name: string,
  address: string,
  googleMapsUri?: string | null,
  placeId?: string | null
): string {
  if (googleMapsUri) return googleMapsUri;
  if (placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;
}
