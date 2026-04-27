import { supabase } from "./supabase";

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 120,
  pro: 400, // plan key "pro" = producto Agency
};

function toUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    clerkId: row.clerk_id,
    email: row.email ?? null,
    tokens: row.tokens ?? 3,
    plan: row.plan ?? "free",
    tokensResetAt: row.tokens_reset_at ?? row.created_at,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

    async create({ data }: { data: { clerkId: string; tokens?: number; email?: string } }) {
      const { data: row, error } = await supabase
        .from("users")
        .insert({
          clerk_id: data.clerkId,
          email: data.email ?? null,
          tokens: data.tokens ?? 3,
          plan: "free",
          tokens_reset_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return toUser(row)!;
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
        plan?: string;
        tokens_reset_at?: string;
        stripe_customer_id?: string;
        stripe_subscription_id?: string | null;
      };
    }) {
      const column = where.clerkId ? "clerk_id" : "id";
      const value = where.clerkId ?? where.id;

      const patch: Record<string, any> = {};

      if (data.plan !== undefined) patch.plan = data.plan;
      if (data.tokens_reset_at !== undefined) patch.tokens_reset_at = data.tokens_reset_at;
      if (data.stripe_customer_id !== undefined) patch.stripe_customer_id = data.stripe_customer_id;
      if (data.stripe_subscription_id !== undefined) patch.stripe_subscription_id = data.stripe_subscription_id;

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
};
