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
  | "plan_changed";

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
