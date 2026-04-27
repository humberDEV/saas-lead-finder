import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();
  if (!input || input.length < 2) return NextResponse.json({ suggestions: [] });

  const apiKey = process.env.GOOGLE_API_KEY;

  // New Places API — same one used in /api/search
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
    },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ["locality", "administrative_area_level_3", "administrative_area_level_2"],
      languageCode: "es",
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error("[autocomplete] Google API error:", JSON.stringify(data.error ?? data));
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions: string[] = (data.suggestions ?? [])
    .slice(0, 6)
    .map((s: any) => s.placePrediction?.text?.text as string)
    .filter(Boolean);

  return NextResponse.json({ suggestions });
}
