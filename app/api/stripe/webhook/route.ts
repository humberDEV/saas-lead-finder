import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db, PLAN_LIMITS } from "@/lib/db";
import { trackEvent } from "@/lib/events";
import { sendPaymentFailedEmail, sendPaymentReceiptEmail } from "@/lib/email";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Disable body parsing so we can verify the raw Stripe signature
export const dynamic = "force-dynamic";

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const legacySubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;
  const subscription =
    legacySubscription ?? invoice.parent?.subscription_details?.subscription;
  return typeof subscription === "string" ? subscription : subscription?.id ?? null;
}

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

  // The third-failure handler downgrades immediately. The later Stripe
  // subscription.deleted webhook must therefore be a no-op.
  if (user.plan === "free" && !user.stripeSubscriptionId) return;

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
        if (!getInvoiceSubscriptionId(invoice)) break;

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
        await trackEvent(user.id, "payment_recovered", {
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
        }).catch(() => {});

        const email = invoice.customer_email ?? user.email;
        if (email && invoice.hosted_invoice_url) {
          const amount = new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: invoice.currency.toUpperCase(),
          }).format(invoice.amount_paid / 100);
          const sent = await sendPaymentReceiptEmail(email, {
            name: user.name,
            amount,
            invoiceUrl: invoice.hosted_invoice_url,
            invoicePdfUrl: invoice.invoice_pdf,
            invoiceId: invoice.id,
          });
          if (sent) {
            await trackEvent(user.id, "payment_receipt_email_sent", {
              stripeEventId: event.id,
              invoiceId: invoice.id,
            }).catch(() => {});
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const user = await db.user.findByStripeCustomerId(customerId);
        if (!user) {
          console.warn("[stripe/webhook] Payment failed for unknown customer:", customerId);
          break;
        }

        const attemptCount = invoice.attempt_count ?? 1;
        await trackEvent(user.id, "payment_failed", {
          stripeEventId: event.id,
          invoiceId: invoice.id,
          attemptCount,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
          nextPaymentAttempt: invoice.next_payment_attempt,
        }).catch(() => {});

        // Stripe can retry the webhook. Resend's key prevents duplicate emails
        // for the same invoice attempt while allowing a later failed attempt.
        // One reminder per invoice, exactly on the second failed attempt. Later
        // retries are still tracked but don't consume email quota.
        if (attemptCount === 2) {
          const email = invoice.customer_email ?? user.email;
          const paymentUrl = invoice.hosted_invoice_url ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tryhuntly.com"}/es/settings`;
          if (email) {
            const amount = new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: invoice.currency.toUpperCase(),
            }).format(invoice.amount_due / 100);
            const sent = await sendPaymentFailedEmail(email, {
              name: user.name,
              paymentUrl,
              amount,
              attemptCount,
              invoiceId: invoice.id,
            });
            if (sent) {
              await trackEvent(user.id, "payment_failed_email_sent", {
                stripeEventId: event.id,
                invoiceId: invoice.id,
                attemptCount,
              }).catch(() => {});
            }
          }
        }

        if (attemptCount >= 3) {
          const subscriptionId = getInvoiceSubscriptionId(invoice);
          if (subscriptionId) {
            await stripe.subscriptions.cancel(
              subscriptionId,
              {},
              { idempotencyKey: `cancel-after-third-failure/${invoice.id}` }
            );
            await downgradeUser(customerId);
            await trackEvent(user.id, "subscription_cancelled_nonpayment", {
              stripeEventId: event.id,
              invoiceId: invoice.id,
              subscriptionId,
              attemptCount,
            }).catch(() => {});
          }
        }
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
        if (!chargeId) break;
        const charge = await stripe.charges.retrieve(chargeId);
        const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
        if (!customerId) break;
        const user = await db.user.findByStripeCustomerId(customerId);
        if (!user) break;
        await trackEvent(
          user.id,
          event.type === "charge.dispute.created" ? "dispute_opened" : "dispute_closed",
          {
            stripeEventId: event.id,
            disputeId: dispute.id,
            chargeId,
            paymentIntentId:
              typeof dispute.payment_intent === "string"
                ? dispute.payment_intent
                : dispute.payment_intent?.id,
            reason: dispute.reason,
            status: dispute.status,
            amount: dispute.amount,
            currency: dispute.currency,
            evidenceDueBy: dispute.evidence_details?.due_by ?? null,
          }
        ).catch(() => {});
        break;
      }

      case "radar.early_fraud_warning.created": {
        const warning = event.data.object as Stripe.Radar.EarlyFraudWarning;
        const chargeId = typeof warning.charge === "string" ? warning.charge : warning.charge.id;
        const charge = await stripe.charges.retrieve(chargeId);
        const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
        if (!customerId) break;
        const user = await db.user.findByStripeCustomerId(customerId);
        if (!user) break;
        await trackEvent(user.id, "early_fraud_warning", {
          stripeEventId: event.id,
          warningId: warning.id,
          chargeId,
          actionable: warning.actionable,
          fraudType: warning.fraud_type,
        }).catch(() => {});
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
