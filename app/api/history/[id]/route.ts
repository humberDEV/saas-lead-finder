import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/tokens";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await getOrCreateUser(userId);

  const { data, error } = await supabase
    .from("search_history")
    .select("niche, city, results, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    niche: data.niche,
    city: data.city,
    createdAt: data.created_at,
    results: data.results ?? [],
  });
}

// Remove a lead from the results array (save or dismiss)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await getOrCreateUser(userId);
  const { name, address } = await req.json();

  const { data, error } = await supabase
    .from("search_history")
    .select("results")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filtered = (data.results as any[]).filter(
    (r) => !(r.name === name && r.address === address)
  );

  await supabase
    .from("search_history")
    .update({ results: filtered, result_count: filtered.length })
    .eq("id", params.id)
    .eq("user_id", user.id);

  return NextResponse.json({ remaining: filtered.length });
}
