import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/tokens";
import { buildDemoFromLead, generateSlug } from "@/lib/demo";
import type { DemoLeadInput } from "@/lib/demo";
import {
  findExistingDemoForBusiness,
  getDemoQuotaForUser,
  getDemoLimitForPlan,
} from "@/lib/demo-quota";
import { nanoid } from "nanoid";

// POST /api/demos — create a demo from lead data (no DELETE: quota is not refundable)
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(clerkId);
  const plan = user.plan ?? "free";
  const limit = getDemoLimitForPlan(plan);

  if (limit === 0) {
    return NextResponse.json({ error: "upgrade_required", plan }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    address,
    phone,
    rating,
    reviewCount,
    city,
    niche,
    hasWhatsapp,
    website,
    mapsUrl,
    googleMapsUri,
    placeId,
    photoNames,
    openingHours,
    locale,
    country,
  } = body;

  if (!name || !address) {
    return NextResponse.json(
      { error: "name and address are required" },
      { status: 400 }
    );
  }

  const existing = await findExistingDemoForBusiness(user.id, name, address);
  if (existing) {
    const quota = await getDemoQuotaForUser(user.id, plan, user.tokensResetAt);
    return NextResponse.json({
      slug: existing.slug,
      url: `/demo/${existing.slug}`,
      existing: true,
      quota,
    });
  }

  const quota = await getDemoQuotaForUser(user.id, plan, user.tokensResetAt);
  if (!quota.canCreate) {
    return NextResponse.json(
      {
        error: "demo_limit_reached",
        limit: quota.limit,
        used: quota.used,
        periodEnd: quota.periodEnd,
        quota,
      },
      { status: 403 }
    );
  }

  const leadInput: DemoLeadInput = {
    name,
    address,
    phone: phone ?? null,
    rating: rating ?? 0,
    reviewCount: reviewCount ?? 0,
    city: city ?? null,
    niche: niche ?? null,
    hasWhatsapp: hasWhatsapp ?? false,
    website: website ?? null,
    mapsUrl: mapsUrl ?? null,
    googleMapsUri: googleMapsUri ?? null,
    placeId: placeId ?? null,
    photoNames: Array.isArray(photoNames) ? photoNames : undefined,
    openingHours: Array.isArray(openingHours) ? openingHours : undefined,
    locale: locale === "en" ? "en" : "es",
    country: country ?? null,
  };

  let template: string;
  let businessData: Record<string, any>;
  try {
    ({ template, businessData } = await buildDemoFromLead(leadInput));
  } catch (err: any) {
    console.error("[api/demos] buildDemoFromLead failed:", err?.message);
    return NextResponse.json({ error: "Failed to generate demo" }, { status: 500 });
  }

  const slug = generateSlug(name, city ?? address, nanoid(6));

  const demo = await db.demo.create({
    data: { userId: user.id, slug, template, businessData },
  });

  const quotaAfter = await getDemoQuotaForUser(user.id, plan, user.tokensResetAt);

  return NextResponse.json({
    slug: demo.slug,
    url: `/demo/${demo.slug}`,
    preview: businessData,
    existing: false,
    quota: quotaAfter,
  });
}

// GET /api/demos — list demos + monthly quota
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(clerkId);
  const plan = user.plan ?? "free";
  const demos = await db.demo.findMany({ where: { userId: user.id } });
  const quota = await getDemoQuotaForUser(user.id, plan, user.tokensResetAt);

  return NextResponse.json({ demos, quota });
}

// DELETE intentionally unsupported — demos count toward monthly quota permanently
