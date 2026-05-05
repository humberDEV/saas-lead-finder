import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      session_id,
      path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
    } = body;

    if (!session_id || !path) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Geo from Vercel edge headers (available in production)
    const headers = request.headers;
    const country = headers.get("x-vercel-ip-country") ?? null;
    const cityRaw = headers.get("x-vercel-ip-city") ?? null;
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;

    // Get Clerk user ID if authenticated (optional — anon visits still tracked)
    const { userId: clerkId } = await auth();

    // Insert page view
    await supabase.from("page_views").insert({
      session_id,
      path,
      referrer: referrer ?? null,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      utm_term: utm_term ?? null,
      country,
      city,
      clerk_id: clerkId ?? null,
    });

    // First-touch UTM attribution: if user is logged in and has UTMs, store them
    // on the user record (only if not already set)
    if (clerkId && (utm_source || utm_campaign)) {
      const { data: user } = await supabase
        .from("users")
        .select("id, utm_source")
        .eq("clerk_id", clerkId)
        .single();

      if (user && !user.utm_source) {
        await supabase
          .from("users")
          .update({
            utm_source: utm_source ?? null,
            utm_medium: utm_medium ?? null,
            utm_campaign: utm_campaign ?? null,
            utm_term: utm_term ?? null,
          })
          .eq("clerk_id", clerkId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics/track]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
