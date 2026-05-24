import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db, PLAN_LIMITS } from "@/lib/db";
import { trackEvent } from "@/lib/events";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Disable body parsing so we can verify the raw Stripe signature
export const dynamic = "force-dynamic";

async function upgradeUser(clerkId: string, planKey: string, subscriptionId: string) {
  const planConfig = STRIPE_PLANS[planKey];
  if (!planConfig) return;

  const user = await db.user.findUnique({ where: { clerkId } });
  const previousPlan = user?.plan ?? "free";

  await db.user.update({
    where: { clerkId },
    data: {
      plan: planConfig.plan,
      tokens: PLAN_LIMITS[planConfig.plan] ?? planConfig.searches,
      tokens_reset_at: new Date().toISOString(),
      stripe_subscription_id: subscriptionId,
    },
  });

  if (user) {
    if (previousPlan === "free") {
      await trackEvent(user.id, "subscription_started", {
        planKey,
        utm_source: (user as any).utmSource ?? null,
        utm_campaign: (user as any).utmCampaign ?? null,
        utm_term: (user as any).utmTerm ?? null,
      });
    } else if (previousPlan !== planKey) {
      await trackEvent(user.id, "plan_changed", { from: previousPlan, to: planKey });
    }
  }
}

async function downgradeUser(stripeCustomerId: string) {
  const user = await db.user.findByStripeCustomerId(stripeCustomerId);
  if (!user) return;

  const previousPlan = user.plan;

  await db.user.update({
    where: { clerkId: user.clerkId },
    data: {
      plan: "free",
      tokens: PLAN_LIMITS["free"],
      tokens_reset_at: new Date().toISOString(),
      stripe_subscription_id: null,
    },
  });

  await trackEvent(user.id, "subscription_cancelled", { previousPlan });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[stripe/webhook] Signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerkId;
        const planKey = session.metadata?.planKey;
        const subscriptionId = session.subscription as string;

        if (clerkId && planKey && subscriptionId) {
          await upgradeUser(clerkId, planKey, subscriptionId);

          // Referral reward: +50 bonus tokens to both sides, only on first payment
          const paidUser = await db.user.findUnique({ where: { clerkId } });
          if (paidUser?.referredBy) {
            const referral = await db.referral.findUnpaidByReferredUser(paidUser.id).catch(() => null);
            if (referral && referral.referrerUserId !== paidUser.id) {
              await Promise.all([
                db.user.update({ where: { id: paidUser.id }, data: { bonus_tokens: { increment: 50 } } }),
                db.user.update({ where: { id: referral.referrerUserId }, data: { bonus_tokens: { increment: 50 } } }),
                db.referral.markPaid(referral.id),
              ]);
              await trackEvent(paidUser.id, "referral_rewarded", { referrerId: referral.referrerUserId }).catch(() => {});
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkId = subscription.metadata?.clerkId;
        const planKey = subscription.metadata?.planKey;

        // Only act if active/trialing, and metadata is present
        if (
          clerkId &&
          planKey &&
          (subscription.status === "active" || subscription.status === "trialing")
        ) {
          await upgradeUser(clerkId, planKey, subscription.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await downgradeUser(subscription.customer as string);
        break;
      }

      case "invoice.paid": {
        // Subscription renewed successfully → reset tokens to plan limit
        const invoice = event.data.object as Stripe.Invoice;
        // Only act on subscription invoices (not one-off charges)
        if (!("subscription" in invoice) || !invoice.subscription) break;

        const user = await db.user.findByStripeCustomerId(invoice.customer as string);
        if (!user) break;

        // Skip if user is already on free (shouldn't happen, but guard)
        if (user.plan === "free") break;

        const limit = PLAN_LIMITS[user.plan] ?? 3;
        await db.user.update({
          where: { clerkId: user.clerkId },
          data: {
            tokens: limit,
            tokens_reset_at: new Date().toISOString(),
          },
        });
        await trackEvent(user.id, "tokens_reset", { plan: user.plan, tokens: limit }).catch(() => {});
        break;
      }

      case "invoice.payment_failed": {
        // Optional: log or notify. Don't downgrade immediately on first failure.
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[stripe/webhook] Payment failed for customer:", invoice.customer);
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (err: any) {
    console.error("[stripe/webhook] Handler error:", err.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
