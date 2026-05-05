import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/tokens";
import { calculateOpportunityScore } from "@/lib/score";
import { generateContactMessage } from "@/lib/message";
import { parsePhoneNumber } from "libphonenumber-js/max";

const CACHE_DAYS = 7;

// Free preview search — no token deduction, uses same 7-day cache.
// Rate limiting is handled client-side via localStorage (3-day cooldown).
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const niche = searchParams.get("niche");
  const city = searchParams.get("city");
  if (!niche || !city) return NextResponse.json({ error: "niche and city required" }, { status: 400 });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let user;
  try {
    user = await getOrCreateUser(userId);
  } catch {
    return NextResponse.json({ error: "User error" }, { status: 500 });
  }

  // ── Cache check (reuse existing search_history) ──────────────────────────
  try {
    const cached = await db.searchHistory.findRecent({
      where: { userId: user.id, niche, city, withinDays: CACHE_DAYS },
    });
    if (cached) {
      return NextResponse.json({ results: (cached.results as any[]).slice(0, 8), cached: true });
    }
  } catch { /* miss */ }

  // ── Live fetch ────────────────────────────────────────────────────────────
  try {
    const query = `${niche} en ${city}`;
    const googleUrl = "https://places.googleapis.com/v1/places:searchText";
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.internationalPhoneNumber,places.nationalPhoneNumber",
    };

    const res = await fetch(googleUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ textQuery: query, pageSize: 20, languageCode: "es" }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || res.statusText);

    const allPlaces: any[] = data.places || [];

    const places = allPlaces.map((place: any) => {
      const hasWebsite = !!place.websiteUri;
      const rating = place.rating || 0;
      const userRatingsTotal = place.userRatingCount || 0;
      const businessStatus = place.businessStatus || "";
      const phone = place.internationalPhoneNumber || place.nationalPhoneNumber || null;

      let hasWhatsapp = false;
      if (phone) {
        try {
          const phoneNumber = parsePhoneNumber(phone);
          if (phoneNumber) {
            const type = phoneNumber.getType();
            hasWhatsapp = type !== "FIXED_LINE" && type !== "UAN" && type !== "SHARED_COST";
          }
        } catch {
          hasWhatsapp = phone.startsWith("+");
        }
      }

      const { score, explanation, temperature, label } =
        calculateOpportunityScore(hasWebsite, rating, userRatingsTotal, businessStatus, phone);
      const name = place.displayName?.text || "Sin nombre";

      return {
        name, address: place.formattedAddress || "", phone, has_whatsapp: hasWhatsapp,
        website: place.websiteUri || null, has_website: hasWebsite, rating, user_ratings_total: userRatingsTotal,
        business_status: businessStatus, score, temperature, scoreLabel: label, scoreExplanation: explanation,
        suggestedMessage: generateContactMessage(name, hasWebsite, userRatingsTotal, rating, "es", place.websiteUri || null),
      };
    });

    const unique = Array.from(new Map(places.map((p: any) => [p.name + p.address, p])).values());
    unique.sort((a: any, b: any) => b.score - a.score);

    // Save to cache (no token deduction)
    const withOpportunities = unique.filter((p: any) => p.score >= 40);
    if (withOpportunities.length > 0) {
      try {
        await db.searchHistory.create({
          data: { userId: user.id, niche, city, results: unique, resultCount: unique.length },
        });
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ results: unique.slice(0, 8), cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
