import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getStripePlans } from "@/lib/stripe";
import { getOrCreateUser } from "@/lib/tokens";
import { db, PLAN_LIMITS } from "@/lib/db";
import { trackEvent } from "@/lib/events";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const { planKey } = await request.json();
  if (!planKey) return NextResponse.json({ error: "planKey required" }, { status: 400 });

  const user = await getOrCreateUser(clerkId);
  if (!user.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const previousPlan = user.plan ?? "free";

  // Guard: already on this plan — nothing to do
  if (planKey === previousPlan) {
    return NextResponse.json({ ok: true, plan: planKey });
  }

  // ── Cancel → schedule downgrade to free at period end ──────────────────────
  // We do NOT touch the DB here — the user keeps their plan until the period
  // ends, at which point Stripe fires `customer.subscription.deleted` and our
  // webhook downgrades them automatically.
  if (planKey === "free") {
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await trackEvent(user.id, "subscription_cancelled", { previousPlan }).catch(() => {});
    // Return "scheduled" so the UI can show the right message
    return NextResponse.json({ ok: true, plan: previousPlan, scheduled: true });
  }

  // ── Switch between paid plans ───────────────────────────────────────────────
  const plans = getStripePlans();
  const targetPlan = plans[planKey];
  if (!targetPlan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  // Retrieve subscription to get the item ID
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  // If already scheduled for cancellation, un-cancel it first
  if (subscription.cancel_at_period_end) {
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  }

  const itemId = subscription.items.data[0]?.id;
  if (!itemId) return NextResponse.json({ error: "Subscription item not found" }, { status: 400 });

  // Update price + metadata (webhook will see planKey and confirm in DB)
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: targetPlan.priceId }],
    proration_behavior: "create_prorations",
    metadata: { clerkId, planKey },
  });

  // Optimistic DB update — webhook also fires and is idempotent
  await db.user.update({
    where: { clerkId },
    data: {
      plan: planKey,
      tokens: PLAN_LIMITS[planKey] ?? targetPlan.searches,
      tokens_reset_at: new Date().toISOString(),
    },
  });

  await trackEvent(user.id, "plan_changed", { from: previousPlan, to: planKey }).catch(() => {});

  return NextResponse.json({ ok: true, plan: planKey });
}
