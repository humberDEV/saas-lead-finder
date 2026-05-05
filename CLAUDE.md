# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npx tsc --noEmit     # Type-check without emitting
stripe listen --forward-to localhost:3000/api/stripe/webhook  # local Stripe webhooks
```

## Project Map

**Huntly** — Next.js 14 SaaS (App Router) for finding local businesses without websites. Search niche + city → scored leads → WhatsApp/call outreach.

```
app/
  [locale]/                      # next-intl wrapper (EN/ES); translations in messages/
    page.tsx                     # Landing page — redirects to /dashboard if signed in
    layout.tsx                   # Locale provider
    (app)/                       # Authenticated shell (Clerk-protected)
      layout.tsx                 # SidebarProvider → AppShell
      AppShell.tsx               # Sidebar + content layout
      Sidebar.tsx                # Nav + plan badge + credits display
      SidebarContext.tsx         # Mobile sidebar open/close state
      dashboard/page.tsx         # Main UI: search form, lead cards, history replay
      crm/page.tsx               # CRM board: Pendiente / En Contacto / Cerrado
      pricing/page.tsx           # Plan comparison + Stripe checkout buttons

api/
  search/route.ts                # GET  — Places search, cache check, token deduct, score
  autocomplete/route.ts          # GET  — Places autocomplete proxy (cities only)
  leads/route.ts                 # GET/POST/PATCH — saved leads CRUD
  history/route.ts               # GET  — list user's search history
  history/[id]/route.ts          # GET/PATCH — replay or remove lead from results JSONB
  credits/route.ts               # GET  — remaining tokens + plan
  events/route.ts                # POST — product event tracking (client → server)
  stripe/checkout/route.ts       # POST — create Stripe Checkout session
  stripe/webhook/route.ts        # POST — handle Stripe events (excluded from Clerk/intl)
  stripe/portal/route.ts         # POST — create Stripe Customer Portal session

lib/
  db.ts          # Supabase wrapper with Prisma-style API. ALL DB access goes here.
                 #   db.user.{findUnique, create, update, findByStripeCustomerId}
                 #   db.savedLead.{findMany, create, update}
                 #   db.searchHistory.{findRecent, create, findByUser}
  supabase.ts    # Raw Supabase client (used by events.ts directly)
  tokens.ts      # getOrCreateUser(clerkId, profile?) — creates user, syncs Clerk
                 #   profile, resets tokens if 30-day cycle elapsed. Call on every request.
  plans.ts       # PLANS config + PLAN_LIMITS + getStripePriceId(). Source of truth.
  score.ts       # calculateOpportunityScore(hasWebsite, rating, reviewCount, status, phone)
                 #   → { score, explanation, temperature, label }
  message.ts     # generateContactMessage(business) — randomized Spanish cold outreach
  events.ts      # trackEvent(userId, event, props?) — fire-and-forget to product_events
  stripe.ts      # Stripe client + STRIPE_PLANS map
  cities.ts      # ~500 cities in Spanish-speaking countries as "City, Country" strings

i18n/
  routing.ts     # next-intl locale routing config
middleware.ts    # Clerk + next-intl. Protects /:locale/dashboard, /:locale/crm,
                 #   /api/leads, /api/credits. Stripe webhook excluded from all middleware.
```

## Database (Supabase)

```
users            clerk_id, email, name, tokens, plan, tokens_reset_at,
                 stripe_customer_id, stripe_subscription_id,
                 searches_count, first_search_at, last_search_at,
                 first_limit_reached_at, checkout_started_at, last_login_at

saved_leads      user_id, name, address, phone, score, status, notes,
                 website, has_website, has_whatsapp, rating, review_count,
                 suggested_message, temperature, score_label

search_history   user_id, niche, city, results (JSONB array), result_count
                 — 7-day cache; result_count decremented on save/dismiss

product_events   user_id, event, properties (JSONB) — append-only analytics
```

db.ts converts snake_case → camelCase via `toUser()` / `toLead()`. No Prisma at runtime — `prisma/schema.prisma` is vestigial.

## Plans

Defined in `lib/plans.ts`. **Env var names are legacy-mismatched — never rename them.**

| Key    | Searches | Price | Env var                   |
|--------|----------|-------|---------------------------|
| free   | 3        | $0    | —                         |
| go     | 40       | $9    | STRIPE_GO_PRICE_ID        |
| pro    | 100      | $19   | STRIPE_STARTER_PRICE_ID ← legacy name |
| agency | 250      | $39   | STRIPE_PRO_PRICE_ID ← legacy name     |

## Scoring Logic (`lib/score.ts`)

| Condition                          | Score | Label          | Temp |
|------------------------------------|-------|----------------|------|
| No phone                           | 0     | Sin contacto   | 🔴   |
| Not OPERATIONAL                    | 0     | Inactivo       | 🔴   |
| Has website                        | 10    | Ya tiene web   | 🔴   |
| No web + 10–249 reviews (sweet spot)| 95   | Oportunidad ideal | 🟢 |
| No web + 250+ reviews              | 80    | Ticket alto    | 🟡   |
| No web + 1–9 reviews               | 60    | Explorar       | 🟠   |
| No web + 0 reviews                 | 40    | Explorar       | 🟠   |

## Key Gotchas

- **Token deduction only on non-empty results** — `api/search` deducts only when Google Places returns > 0 results.
- **Dismissed leads: no separate table** — hiding a lead does a PATCH to `api/history/[id]` that removes it from the `results` JSONB array in-place.
- **`getOrCreateUser()` has side effects** — triggers monthly token reset if 30+ days since last reset. Must be called on every authenticated request (not just first-time users).
- **Stripe webhook excluded from middleware** — `/api/stripe/webhook` bypasses both Clerk and next-intl (see `middleware.ts` matcher).
- **`[locale]` wraps all pages** — when adding pages, they go under `app/[locale]/`, not `app/` directly.

## Environment Variables

```
GOOGLE_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # optional, bypasses RLS
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
STRIPE_GO_PRICE_ID
STRIPE_STARTER_PRICE_ID            # maps to "pro" plan
STRIPE_PRO_PRICE_ID                # maps to "agency" plan
NEXT_PUBLIC_APP_URL
```
