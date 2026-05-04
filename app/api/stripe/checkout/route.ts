import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { getOrCreateUser } from "@/lib/tokens";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/events";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { planKey } = await request.json();
  const planConfig = STRIPE_PLANS[planKey];
  if (!planConfig) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const [user, clerkUser] = await Promise.all([
    getOrCreateUser(userId),
    currentUser(),
  ]);

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? user.email ?? undefined;

  // Reusar o crear el customer de Stripe
  let stripeCustomerId = user.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { clerkId: userId },
    });
    stripeCustomerId = customer.id;
    await db.user.update({
      where: { clerkId: userId },
      data: { stripe_customer_id: stripeCustomerId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const cookieStore = await cookies();

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: {
      clerkId: userId,
      planKey,
      datafast_visitor_id: cookieStore.get("datafast_visitor_id")?.value ?? "",
      datafast_session_id: cookieStore.get("datafast_session_id")?.value ?? "",
    },
    subscription_data: {
      metadata: { clerkId: userId, planKey },
    },
  });

  // Track checkout started
  await db.user.update({
    where: { clerkId: userId },
    data: { checkout_started_at: new Date().toISOString() },
  }).catch(() => {});
  await trackEvent(user.id, "checkout_started", { planKey }).catch(() => {});

  return NextResponse.json({ url: session.url });
}
