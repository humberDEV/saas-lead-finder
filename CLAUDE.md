# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npx tsc --noEmit     # Type-check without emitting
```

For local Stripe webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture

**Huntly** is a Next.js 14 SaaS (App Router) for finding local businesses without websites via Google Places API. Users search by niche + city, get scored leads with phone numbers, and contact them via WhatsApp/call.

### Stack
- **Next.js 14** (App Router) — no Prisma at runtime, schema file is vestigial
- **Supabase** (PostgreSQL) — all DB access via custom wrapper in `lib/db.ts`, not Prisma Client
- **Clerk** — auth, middleware in `middleware.ts` protects `/dashboard`, `/crm`, `/api/leads`, `/api/credits`
- **Stripe** — subscriptions for Starter ($19) and Agency ($49) plans
- **Google Places API (New)** — `places.googleapis.com/v1/` for both search and autocomplete

### Route Groups
- `app/page.tsx` — public landing page (redirects to `/dashboard` if signed in)
- `app/(app)/` — authenticated shell: `layout.tsx` → `SidebarProvider` → `AppShell` (sidebar + content)
  - `dashboard/page.tsx` — main search UI, results rendering, history replay
  - `crm/page.tsx` — saved leads CRM board (Pendiente/En Contacto/Cerrado columns)
  - `pricing/page.tsx` — plan comparison with Stripe checkout buttons

### API Routes
- `api/search` — Google Places text search, scoring, token deduction (only if results > 0), history save
- `api/autocomplete` — Google Places autocomplete proxy, restricted to `(cities)` types
- `api/leads` — CRUD for saved leads (GET/POST/PATCH)
- `api/history` — list user's search history; `[id]` route supports GET and PATCH (removes leads from results array)
- `api/credits` — returns user's remaining tokens and plan
- `api/stripe/checkout` — creates Stripe Checkout session
- `api/stripe/webhook` — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `api/stripe/portal` — creates Stripe Customer Portal session

### Key Libraries (`lib/`)
- **`db.ts`** — Supabase wrapper mimicking Prisma-style API (`db.user.findUnique()`, `db.savedLead.create()`, etc.). All DB reads/writes go through here. Converts snake_case DB columns to camelCase in `toUser()`/`toLead()`.
- **`tokens.ts`** — `getOrCreateUser()` — single source of truth for user retrieval + automatic monthly token reset (30-day cycle)
- **`score.ts`** — `calculateOpportunityScore()` — deterministic scoring: no phone=0, has website=10, sweet spot is 10-250 reviews without web=95
- **`message.ts`** — generates randomized Spanish-language cold outreach messages based on business profile
- **`stripe.ts`** — Stripe client + `STRIPE_PLANS` map (planKey → priceId + token limit)
- **`cities.ts`** — ~500 cities across all Spanish-speaking countries, grouped by country, exported as flat `"City, Country"` strings for the random city picker

### Data Flow
1. User searches → `api/search` checks cache in `search_history` table (7-day TTL) → if miss, calls Google Places API → scores results → saves to `search_history` → returns results + `historyId`
2. User saves/dismisses a lead → card hides via `hiddenIndexes` state + PATCH to `api/history/[id]` removes lead from the `results` JSONB array in-place (no separate dismissed table)
3. User saves to CRM → POST to `api/leads` with full lead data (score, rating, website, temperature, suggested message, etc.)

### Plan System
Three plans: `free` (3 tokens), `starter` (120), `pro` (400 — displayed as "Agency"). Plan limits defined in `PLAN_LIMITS` in `db.ts`. Internal plan key for Agency is `"pro"`.

### Database Tables (Supabase)
- `users` — clerk_id, tokens, plan, tokens_reset_at, stripe_customer_id, stripe_subscription_id
- `saved_leads` — full lead data including website, has_website, has_whatsapp, rating, review_count, suggested_message, temperature, score_label
- `search_history` — niche, city, results (JSONB array), result_count (mutable — decremented when leads are saved/dismissed)

### Webhook Flow
Stripe CLI forwards events locally. The webhook verifies signatures via `STRIPE_WEBHOOK_SECRET`. On `checkout.session.completed`, it reads `clerkId` and `planKey` from session metadata, updates user plan + tokens. On `subscription.deleted`, it downgrades to free via `stripe_customer_id` lookup.

## Environment Variables

Required in `.env.local`:
```
GOOGLE_API_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
STRIPE_STARTER_PRICE_ID, STRIPE_PRO_PRICE_ID,
NEXT_PUBLIC_APP_URL
```

Optional: `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS; falls back to anon key).
