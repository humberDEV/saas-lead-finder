import { resolvePhotoUrls } from "./photos";
import type { DemoLocale } from "./types";

export interface PlaceReviewSnippet {
  author: string;
  rating: number;
  text: string;
  timeAgo: string | null;
}

export interface PlaceDetailsEnrichment {
  rating?: number;
  reviewCount?: number;
  phone?: string | null;
  website?: string | null;
  googleMapsUri?: string | null;
  openingHours?: string[] | null;
  photoNames?: string[];
  /** Color de fondo del pin de Google (pista de marca) */
  iconBackgroundColor?: string | null;
  reviews: PlaceReviewSnippet[];
}

function reviewFingerprint(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 12)
    .join(" ");
}

/** Quita reseñas vacías, duplicadas o casi idénticas */
export function dedupeReviews(
  raw: PlaceReviewSnippet[],
  max: number
): PlaceReviewSnippet[] {
  const seenText = new Set<string>();
  const seenAuthor = new Set<string>();
  const out: PlaceReviewSnippet[] = [];

  const sorted = [...raw]
    .filter((r) => r.text.length >= 20)
    .sort((a, b) => b.rating - a.rating || b.text.length - a.text.length);

  for (const r of sorted) {
    if (out.length >= max) break;
    const fp = reviewFingerprint(r.text);
    if (fp.length < 8) continue;
    if (seenText.has(fp)) continue;
    if (seenAuthor.has(r.author.toLowerCase())) continue;
    seenText.add(fp);
    seenAuthor.add(r.author.toLowerCase());
    out.push(r);
  }

  return out;
}

function toPlaceResourceId(placeId: string): string {
  const id = placeId.trim();
  if (id.startsWith("places/")) return id;
  return `places/${id}`;
}

/**
 * Second Google Places call — reviews, extra photos, hours, phone.
 * Only runs when creating a demo (server-side).
 */
export async function fetchPlaceDetails(
  placeId: string | null | undefined,
  locale: DemoLocale = "es"
): Promise<PlaceDetailsEnrichment | null> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key || !placeId?.trim()) return null;

  const resource = toPlaceResourceId(placeId);
  const languageCode = locale === "en" ? "en" : "es";

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${resource}?languageCode=${languageCode}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": [
            "reviews",
            "rating",
            "userRatingCount",
            "photos",
            "regularOpeningHours",
            "websiteUri",
            "googleMapsUri",
            "internationalPhoneNumber",
            "nationalPhoneNumber",
            "iconBackgroundColor",
          ].join(","),
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      console.warn("[demo] Place details failed:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const place = await res.json();

    const reviews = dedupeReviews(
      (place.reviews ?? []).map((r: {
        rating?: number;
        text?: { text?: string };
        relativePublishTimeDescription?: string;
        authorAttribution?: { displayName?: string };
      }) => ({
        author:
          r.authorAttribution?.displayName?.trim() ||
          (locale === "en" ? "Google user" : "Usuario de Google"),
        rating: r.rating ?? 5,
        text: (r.text?.text ?? "").trim(),
        timeAgo: r.relativePublishTimeDescription ?? null,
      })),
      3
    );

    const photoNames = (place.photos ?? [])
      .slice(0, 6)
      .map((p: { name?: string }) => p.name)
      .filter(Boolean) as string[];

    return {
      rating: place.rating,
      reviewCount: place.userRatingCount,
      phone: place.internationalPhoneNumber || place.nationalPhoneNumber || null,
      website: place.websiteUri ?? null,
      googleMapsUri: place.googleMapsUri ?? null,
      openingHours: place.regularOpeningHours?.weekdayDescriptions ?? null,
      photoNames: photoNames.length ? photoNames : undefined,
      iconBackgroundColor: place.iconBackgroundColor ?? null,
      reviews,
    };
  } catch (e) {
    console.warn("[demo] Place details error:", e);
    return null;
  }
}

/** Merge enrichment + resolve photo URLs */
export async function enrichLeadFromPlaceDetails(
  placeId: string | null | undefined,
  locale: DemoLocale,
  existingPhotoNames?: string[]
): Promise<{
  enrichment: PlaceDetailsEnrichment | null;
  photoUrls: string[];
}> {
  const enrichment = await fetchPlaceDetails(placeId, locale);
  const names = [
    ...(enrichment?.photoNames ?? []),
    ...(existingPhotoNames ?? []),
  ];
  const uniqueNames = Array.from(new Set(names)).slice(0, 6);
  const photoUrls = await resolvePhotoUrls(uniqueNames, 4);
  return { enrichment, photoUrls };
}
