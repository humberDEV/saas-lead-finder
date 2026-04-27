import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/db";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Disable body parsing so we can verify the raw Stripe signature
export const dynamic = "force-dynamic";

async function upgradeUser(clerkId: string, planKey: string, subscriptionId: string) {
  const planConfig = STRIPE_PLANS[planKey];
  if (!planConfig) return;

  await db.user.update({
    where: { clerkId },
    data: {
      plan: planConfig.plan,
      tokens: PLAN_LIMITS[planConfig.plan],
      tokens_reset_at: new Date().toISOString(),
      stripe_subscription_id: subscriptionId,
    },
  });
}

async function downgradeUser(stripeCustomerId: string) {
  const user = await db.user.findByStripeCustomerId(stripeCustomerId);
  if (!user) return;

  await db.user.update({
    where: { clerkId: user.clerkId },
    data: {
      plan: "free",
      tokens: PLAN_LIMITS["free"],
      tokens_reset_at: new Date().toISOString(),
      stripe_subscription_id: null,
    },
  });
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
