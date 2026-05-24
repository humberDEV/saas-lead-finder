import { supabase } from "./supabase";
import { PLAN_LIMITS, DEMO_LIMITS } from "./plans";

// Re-export DEMO_LIMITS for convenience
export { DEMO_LIMITS };

// Re-export so existing imports still work
export { PLAN_LIMITS };

function toUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    clerkId: row.clerk_id,
    email: row.email ?? null,
    name: row.name ?? null,
    tokens: row.tokens ?? 3,
    bonusTokens: row.bonus_tokens ?? 0,
    plan: row.plan ?? "free",
    tokensResetAt: row.tokens_reset_at ?? row.created_at,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    searchesCount: row.searches_count ?? 0,
    firstSearchAt: row.first_search_at ?? null,
    lastSearchAt: row.last_search_at ?? null,
    firstLimitReachedAt: row.first_limit_reached_at ?? null,
    checkoutStartedAt: row.checkout_started_at ?? null,
    lastLoginAt: row.last_login_at ?? null,
    utmSource: row.utm_source ?? null,
    utmMedium: row.utm_medium ?? null,
    utmCampaign: row.utm_campaign ?? null,
    utmTerm: row.utm_term ?? null,
    referralCode: row.referral_code ?? null,
    referredBy: row.referred_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDemo(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    template: row.template,
    businessData: row.business_data,
    viewsCount: row.views_count ?? 0,
    createdAt: row.created_at,
  };
}

function toLead(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    phone: row.phone ?? null,
    score: row.score,
    status: row.status,
    notes: row.notes ?? null,
    website: row.website ?? null,
    hasWebsite: row.has_website ?? false,
    hasWhatsapp: row.has_whatsapp ?? false,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    suggestedMessage: row.suggested_message ?? null,
    temperature: row.temperature ?? null,
    scoreLabel: row.score_label ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const db = {
  user: {
    async findUnique({ where }: { where: { clerkId?: string; id?: string } }) {
      const column = where.clerkId ? "clerk_id" : "id";
      const value = where.clerkId ?? where.id;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq(column, value)
        .single();
      return toUser(data);
    },

    async create({ data }: { data: { clerkId: string; tokens?: number; email?: string; name?: string; referralCode?: string; referredBy?: string } }) {
      const { data: row, error } = await supabase
        .from("users")
        .insert({
          clerk_id: data.clerkId,
          email: data.email ?? null,
          name: data.name ?? null,
          tokens: data.tokens ?? 3,
          bonus_tokens: 0,
          plan: "free",
          tokens_reset_at: new Date().toISOString(),
          referral_code: data.referralCode ?? null,
          referred_by: data.referredBy ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toUser(row)!;
    },

    async findByReferralCode(code: string) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("referral_code", code)
        .single();
      return toUser(data);
    },

    async findByStripeCustomerId(stripeCustomerId: string) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();
      return toUser(data);
    },

    async update({
      where,
      data,
    }: {
      where: { clerkId?: string; id?: string };
      data: {
        tokens?: { decrement: number } | number;
        bonus_tokens?: { increment: number } | { decrement: number } | number;
        plan?: string;
        email?: string;
        name?: string;
        tokens_reset_at?: string;
        stripe_customer_id?: string;
        stripe_subscription_id?: string | null;
        searches_count_increment?: boolean;
        first_search_at?: string;
        last_search_at?: string;
        first_limit_reached_at?: string;
        checkout_started_at?: string;
        last_login_at?: string;
        referral_code?: string;
        referred_by?: string | null;
      };
    }) {
      const column = where.clerkId ? "clerk_id" : "id";
      const value = where.clerkId ?? where.id;

      const patch: Record<string, any> = {};

      if (data.plan !== undefined) patch.plan = data.plan;
      if (data.email !== undefined) patch.email = data.email;
      if (data.name !== undefined) patch.name = data.name;
      if (data.tokens_reset_at !== undefined) patch.tokens_reset_at = data.tokens_reset_at;
      if (data.stripe_customer_id !== undefined) patch.stripe_customer_id = data.stripe_customer_id;
      if (data.stripe_subscription_id !== undefined) patch.stripe_subscription_id = data.stripe_subscription_id;
      if (data.first_search_at !== undefined) patch.first_search_at = data.first_search_at;
      if (data.last_search_at !== undefined) patch.last_search_at = data.last_search_at;
      if (data.first_limit_reached_at !== undefined) patch.first_limit_reached_at = data.first_limit_reached_at;
      if (data.checkout_started_at !== undefined) patch.checkout_started_at = data.checkout_started_at;
      if (data.last_login_at !== undefined) patch.last_login_at = data.last_login_at;

      // Handle searches_count increment
      if (data.searches_count_increment) {
        const { data: current } = await supabase
          .from("users")
          .select("searches_count")
          .eq(column, value)
          .single();
        patch.searches_count = (current?.searches_count ?? 0) + 1;
      }

      if (typeof data.tokens === "object" && data.tokens !== null && "decrement" in data.tokens) {
        const { data: current } = await supabase
          .from("users")
          .select("tokens")
          .eq(column, value)
          .single();
        patch.tokens = Math.max(0, (current?.tokens ?? 0) - data.tokens.decrement);
      } else if (typeof data.tokens === "number") {
        patch.tokens = data.tokens;
      }

      if (data.bonus_tokens !== undefined) {
        if (typeof data.bonus_tokens === "object" && data.bonus_tokens !== null) {
          const { data: current } = await supabase
            .from("users")
            .select("bonus_tokens")
            .eq(column, value)
            .single();
          const cur = current?.bonus_tokens ?? 0;
          if ("increment" in data.bonus_tokens) {
            patch.bonus_tokens = cur + data.bonus_tokens.increment;
          } else if ("decrement" in data.bonus_tokens) {
            patch.bonus_tokens = Math.max(0, cur - data.bonus_tokens.decrement);
          }
        } else if (typeof data.bonus_tokens === "number") {
          patch.bonus_tokens = data.bonus_tokens;
        }
      }

      if (data.referral_code !== undefined) patch.referral_code = data.referral_code;
      if (data.referred_by !== undefined) patch.referred_by = data.referred_by;

      const { data: row, error } = await supabase
        .from("users")
        .update(patch)
        .eq(column, value)
        .select()
        .single();
      if (error) throw error;
      return toUser(row)!;
    },
  },

  savedLead: {
    async findMany({
      where,
      orderBy,
    }: {
      where: { userId: string };
      orderBy?: { createdAt: "asc" | "desc" };
    }) {
      let query = supabase
        .from("saved_leads")
        .select("*")
        .eq("user_id", where.userId);

      if (orderBy?.createdAt === "desc") {
        query = query.order("created_at", { ascending: false });
      } else if (orderBy?.createdAt === "asc") {
        query = query.order("created_at", { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toLead);
    },

    async create({
      data,
    }: {
      data: {
        userId: string;
        name: string;
        address: string;
        phone?: string | null;
        score: number;
        status?: string;
        notes?: string | null;
        website?: string | null;
        hasWebsite?: boolean;
        hasWhatsapp?: boolean;
        rating?: number;
        reviewCount?: number;
        suggestedMessage?: string | null;
        temperature?: string | null;
        scoreLabel?: string | null;
      };
    }) {
      const { data: row, error } = await supabase
        .from("saved_leads")
        .insert({
          user_id: data.userId,
          name: data.name,
          address: data.address,
          phone: data.phone ?? null,
          score: data.score,
          status: data.status ?? "PENDIENTE",
          notes: data.notes ?? null,
          website: data.website ?? null,
          has_website: data.hasWebsite ?? false,
          has_whatsapp: data.hasWhatsapp ?? false,
          rating: data.rating ?? 0,
          review_count: data.reviewCount ?? 0,
          suggested_message: data.suggestedMessage ?? null,
          temperature: data.temperature ?? null,
          score_label: data.scoreLabel ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toLead(row)!;
    },

    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: { status?: string; notes?: string | null };
    }) {
      const { data: row, error } = await supabase
        .from("saved_leads")
        .update(data)
        .eq("id", where.id)
        .select()
        .single();
      if (error) throw error;
      return toLead(row)!;
    },

    async delete({ where }: { where: { id: string; userId: string } }) {
      const { error } = await supabase
        .from("saved_leads")
        .delete()
        .eq("id", where.id)
        .eq("user_id", where.userId);
      if (error) throw error;
    },
  },

  searchHistory: {
    /** Returns the most recent cached search for this user+niche+city within `withinDays` days, or null */
    async findRecent({
      where,
    }: {
      where: { userId: string; niche: string; city: string; withinDays: number };
    }) {
      const since = new Date(
        Date.now() - where.withinDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data } = await supabase
        .from("search_history")
        .select("results, result_count, created_at")
        .eq("user_id", where.userId)
        .ilike("niche", where.niche)
        .ilike("city", where.city)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return data ?? null;
    },

    async create({
      data,
    }: {
      data: {
        userId: string;
        niche: string;
        city: string;
        results: any[];
        resultCount: number;
      };
    }): Promise<string> {
      const { data: row, error } = await supabase
        .from("search_history")
        .insert({
          user_id: data.userId,
          niche: data.niche,
          city: data.city,
          results: data.results,
          result_count: data.resultCount,
        })
        .select("id")
        .single();
      if (error) throw error;
      return row.id as string;
    },

    async findByUser({
      userId,
      limit = 20,
    }: {
      userId: string;
      limit?: number;
    }) {
      const { data, error } = await supabase
        .from("search_history")
        .select("id, niche, city, result_count, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  },

  demo: {
    async create({
      data,
    }: {
      data: {
        userId: string;
        slug: string;
        template: string;
        businessData: Record<string, any>;
      };
    }) {
      const { data: row, error } = await supabase
        .from("demos")
        .insert({
          user_id: data.userId,
          slug: data.slug,
          template: data.template,
          business_data: data.businessData,
          views_count: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return toDemo(row)!;
    },

    async findBySlug(slug: string) {
      const { data } = await supabase
        .from("demos")
        .select("*")
        .eq("slug", slug)
        .single();
      return toDemo(data);
    },

    async findMany({ where }: { where: { userId: string } }) {
      const { data, error } = await supabase
        .from("demos")
        .select("*")
        .eq("user_id", where.userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toDemo);
    },

    async countByUser(userId: string): Promise<number> {
      const { count, error } = await supabase
        .from("demos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (error) throw error;
      return count ?? 0;
    },

    /** Demos creadas desde `since` (ISO) — cuota mensual Go. */
    async countByUserSince(userId: string, since: string): Promise<number> {
      const { count, error } = await supabase
        .from("demos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if (error) throw error;
      return count ?? 0;
    },

    async incrementViews(slug: string) {
      const { data: current } = await supabase
        .from("demos")
        .select("views_count")
        .eq("slug", slug)
        .single();
      if (!current) return;
      await supabase
        .from("demos")
        .update({ views_count: (current.views_count ?? 0) + 1 })
        .eq("slug", slug);
    },
  },

  referral: {
    async create({ referrerUserId, referredUserId }: { referrerUserId: string; referredUserId: string }) {
      const { error } = await supabase.from("referrals").insert({
        referrer_user_id: referrerUserId,
        referred_user_id: referredUserId,
        status: "signed_up",
      });
      if (error) throw error;
    },

    /** Returns the unpaid referral for a given referred user, or null. */
    async findUnpaidByReferredUser(referredUserId: string) {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_user_id", referredUserId)
        .eq("status", "signed_up")
        .single();
      if (!data) return null;
      return {
        id: data.id as string,
        referrerUserId: data.referrer_user_id as string,
        referredUserId: data.referred_user_id as string,
        status: data.status as string,
        createdAt: data.created_at as string,
      };
    },

    async markPaid(id: string) {
      await supabase
        .from("referrals")
        .update({ status: "paid", rewarded_at: new Date().toISOString() })
        .eq("id", id);
    },

    async statsByReferrer(referrerUserId: string) {
      const { data } = await supabase
        .from("referrals")
        .select("status")
        .eq("referrer_user_id", referrerUserId);
      const rows = data ?? [];
      return {
        total: rows.length,
        paid: rows.filter((r) => r.status === "paid").length,
        pending: rows.filter((r) => r.status === "signed_up").length,
      };
    },
  },
};
