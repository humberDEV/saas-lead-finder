import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/tokens";
import { calculateOpportunityScore } from "@/lib/score";
import { generateContactMessage } from "@/lib/message";
import { trackEvent } from "@/lib/events";
import { parsePhoneNumber } from "libphonenumber-js/max";

const CACHE_DAYS = 7; // Re-use results for 7 days before hitting Google again

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const niche = searchParams.get("niche");
  const city = searchParams.get("city");
  const locale = searchParams.get("locale") === "en" ? "en" : "es";

  if (!niche || !city) {
    return NextResponse.json(
      { error: "Niche and city are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API Key is not configured" },
      { status: 500 }
    );
  }

  // Get user and apply monthly reset if needed
  let user;
  try {
    user = await getOrCreateUser(userId);
  } catch {
    return NextResponse.json({ error: "Error al obtener el usuario." }, { status: 500 });
  }

  if (user.tokens <= 0) {
    return NextResponse.json(
      { error: "Sin búsquedas disponibles. Actualiza tu plan para continuar." },
      { status: 402 }
    );
  }

  // ── CACHE CHECK ─────────────────────────────────────────────────────────────
  try {
    const cached = await db.searchHistory.findRecent({
      where: { userId: user.id, niche, city, withinDays: CACHE_DAYS },
    });

    if (cached) {
      return NextResponse.json({
        results: cached.results as any[],
        cached: true,
        cachedAt: cached.created_at,
      });
    }
  } catch {
    // Cache miss or table not created yet — continue to live fetch
  }

  // ── LIVE FETCH ───────────────────────────────────────────────────────────────
  try {
    const query = `${niche} en ${city}`;
    const googleUrl = "https://places.googleapis.com/v1/places:searchText";

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.internationalPhoneNumber,places.nationalPhoneNumber,nextPageToken",
    };

    // Primera página
    const res1 = await fetch(googleUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ textQuery: query, pageSize: 20, languageCode: locale }),
    });
    const data1 = await res1.json();
    if (!res1.ok || data1.error) {
      console.error("Google Places API Error:", data1);
      throw new Error(`Google API Error: ${data1.error?.message || res1.statusText}`);
    }

    let allPlaces: any[] = data1.places || [];

    // Segunda página si hay token
    if (data1.nextPageToken) {
      const res2 = await fetch(googleUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ pageToken: data1.nextPageToken }),
      });
      const data2 = await res2.json();
      if (res2.ok && !data2.error) {
        allPlaces = [...allPlaces, ...(data2.places || [])];
      }
    }

    const places = allPlaces.map((place: any) => {
      const hasWebsite = !!place.websiteUri;
      const rating = place.rating || 0;
      const userRatingsTotal = place.userRatingCount || 0;
      const businessStatus = place.businessStatus || "";
      const phone =
        place.internationalPhoneNumber || place.nationalPhoneNumber || null;

      let hasWhatsapp = false;
      if (phone) {
        try {
          const phoneNumber = parsePhoneNumber(phone);
          if (phoneNumber) {
            const type = phoneNumber.getType();
            // FIXED_LINE definitivo → no WhatsApp; todo lo demás sí
            hasWhatsapp = type !== "FIXED_LINE" && type !== "UAN" && type !== "SHARED_COST";
          }
        } catch {
          // Si no se puede parsear pero tiene prefijo internacional → asumir móvil
          hasWhatsapp = phone.startsWith("+");
        }
      }

      const { score, explanation, temperature, label } =
        calculateOpportunityScore(
          hasWebsite, rating, userRatingsTotal, businessStatus, phone
        );

      const name = place.displayName?.text || "Sin nombre";

      return {
        name,
        address: place.formattedAddress || "",
        phone,
        has_whatsapp: hasWhatsapp,
        website: place.websiteUri || null,
        has_website: hasWebsite,
        rating,
        user_ratings_total: userRatingsTotal,
        business_status: businessStatus,
        score,
        temperature,
        scoreLabel: label,
        scoreExplanation: explanation,
        suggestedMessage: generateContactMessage(
          name, hasWebsite, userRatingsTotal, rating, locale, place.websiteUri || null
        ),
      };
    });

    const uniquePlaces = Array.from(
      new Map(places.map((item: any) => [item.name + item.address, item])).values()
    );
    uniquePlaces.sort((a: any, b: any) => b.score - a.score);

    // Descontar crédito solo si hay leads reales (sin web + contactables)
    const hasOpportunities = uniquePlaces.some((p: any) => p.score >= 40);
    const now = new Date().toISOString();

    if (hasOpportunities) {
      // Decrement token + update activity fields
      await db.user.update({
        where: { clerkId: userId },
        data: {
          tokens: { decrement: 1 },
          searches_count_increment: true,
          last_search_at: now,
          ...(!user.firstSearchAt ? { first_search_at: now } : {}),
        },
      });

      // Re-read tokens to check if free user just hit 0
      if (user.plan === "free" && user.tokens <= 1 && !user.firstLimitReachedAt) {
        await db.user.update({
          where: { clerkId: userId },
          data: { first_limit_reached_at: now },
        });
        await trackEvent(user.id, "free_limit_reached");
      }

      await trackEvent(user.id, "search_completed", { niche, city, resultCount: uniquePlaces.length });
    }

    // Guardar en historial y devolver el ID para que el cliente pueda mutar los results
    let historyId: string | null = null;
    try {
      historyId = await db.searchHistory.create({
        data: {
          userId: user.id,
          niche,
          city,
          results: uniquePlaces,
          resultCount: uniquePlaces.length,
        },
      });
    } catch (err) {
      console.error("[search_history] Error al guardar:", err);
    }

    return NextResponse.json({ results: uniquePlaces as any[], historyId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
