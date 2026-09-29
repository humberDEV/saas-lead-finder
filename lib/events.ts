import { supabase } from "./supabase";

export type ProductEvent =
  | "user_signed_up"
  | "user_logged_in"
  | "search_completed"
  | "free_limit_reached"
  | "paywall_viewed"
  | "checkout_started"
  | "subscription_started"
  | "subscription_cancelled"
  | "plan_changed"
  | "tokens_reset"
  | "payment_failed"
  | "payment_failed_email_sent"
  | "payment_recovered"
  | "payment_receipt_email_sent"
  | "subscription_cancelled_nonpayment"
  | "dispute_opened"
  | "dispute_closed"
  | "early_fraud_warning"
  | "reactivation_email_sent"
  | "welcome_email_sent"
  | "limit_reached_email_sent"
  | "referral_rewarded"
  | "referral_code_claimed";

export async function trackEvent(
  userId: string,
  event: ProductEvent,
  properties?: Record<string, unknown>
) {
  try {
    await supabase.from("product_events").insert({
      user_id: userId,
      event,
      properties: properties ?? {},
    });
  } catch (err) {
    console.error("[events] Failed to track:", event, err);
  }
}
