# LiquidVotes — Frontend Web App

The Next.js frontend for the LiquidVotes voting platform. It talks to the
LiquidVotes backend (`awards-platform-backend`) for auth, events, payments,
results, and settlements.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui-style components · axios · zod + react-hook-form · recharts ·
lucide-react

> 🚨 **Correction (Aug 2026):** this app is **fully wired to the LiquidVotes
> backend**. Earlier versions of this doc described a scaffold that was "ready
> for backend integration via Supabase/Stripe" — that is no longer the case.
> Auth is JWT-based via the backend (not Supabase Auth), payments run through
> **Paystack**, and the schema lives in Prisma (see the backend README).

---

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Page Map](#page-map)
- [Key User Flows](#key-user-flows)
- [API Client](#api-client)
- [Design System](#design-system)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Start the backend first (see awards-platform-backend/README.md)
cd ../awards-platform-backend && npm run dev   # → http://localhost:4000

# 2. Frontend
cd "../awards-platform-frontend (3)"
cp .env.example .env.local
npm install
npm run dev                                    # → http://localhost:3000
```

The frontend calls `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

---

## Environment Variables

All keys are in [`.env.example`](./.env.example). Summary:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:4000`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `NEXT_PUBLIC_APP_NAME` | Display name (`LiquidVotes`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (assets) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key for client-side checkout |

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Dev server with HMR |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint .` | Lint |

---

## Architecture

```
app/
├── layout.tsx                  # Root layout
├── page.tsx                    # Homepage (hero, CTAs)
├── awards/                     # Public award/event discovery
│   ├── page.tsx                #   browse events
│   ├── [eventId]/page.tsx      #   event detail + categories
│   └── [eventId]/[categoryId]/page.tsx   # category with nominees
├── results/page.tsx            # Public results page (?eventId=…)
├── pricing/ · about/ · contact/ · faq/ · help/ · team/
├── terms/ · privacy/ · security/
├── login/ · signup/
├── certificate/ · event-not-found/
├── profile/ · settings/ · billing/ · api-keys/ · organization/
├── voter/                      # Voter area (layout: nav + footer)
│   ├── assistant/              #   event-code entry
│   ├── nominee/[code]/         #   nominee detail + vote selector
│   ├── checkout/               #   Paystack checkout
│   ├── confirmation/           #   post-payment confirmation (+pending polling)
│   ├── payment-failed/         #   failed/abandoned payment
│   ├── dashboard/              #   overview
│   └── history/                #   real transaction history (API-backed)
├── organizer/                  # Organizer area
│   ├── dashboard/ · events/ · events/new/ · events/[eventId]/
│   ├── events/[eventId]/details/ · nominees/ · winners/ · analytics/
│   ├── settlements/ · branding/ · downloads/ · share/ · profile/
└── admin/                      # Admin area
    ├── login/ · dashboard/ · events/ · organizations/ · organizations/[id]/
    ├── payments/ · withdrawals/ · subscriptions/ · reports/ · support/
    ├── users/ · settings/ · audit-logs/

components/
├── shared/   # Navigation, Footer, AuthGuard, ImageUpload
├── ui/       # button, card, input, badge, tabs
└── …         # feature components

lib/
├── api.ts    # axios client + typed API modules (auth/events/categories/nominees/payments/organizer/admin)
├── hooks.ts  # useWarmUp (pings /health to wake Render free instances)
├── validators.ts  # zod schemas
└── utils.ts  # cn() and helpers
```

The **Navigation and Footer are present on every page** (public, auth,
account, and role areas) — a fix from the Aug 2026 session.

---

## Page Map

### Public
- `/` — homepage with Cast Your Vote / Browse Awards / Host an Event CTAs
- `/awards` — browse published events
- `/awards/[eventId]` — event page with categories, live counts (respecting
  visibility), winner badges on announced categories
- `/awards/[eventId]/[categoryId]` — category with nominee list + leaderboard
- `/results?eventId=…` — **results page**: full counts + ranking for every
  nominee once the event is closed; winner is highlighted
- `/pricing`, `/about`, `/contact`, `/faq`, `/help`, `/team`, `/terms`,
  `/privacy`, `/security`

### Auth & Account
- `/login`, `/signup` (role: voter/organizer)
- `/profile`, `/settings`, `/billing`, `/api-keys`, `/organization`
  (static scaffolds — no backend models exist yet for these)
- `/certificate`, `/event-not-found`

### Voter (`/voter/*`)
- `/assistant` — event-code entry
- `/nominee/[code]` — nominee detail, vote quantity selector, payment initiate
- `/checkout` — Paystack redirect
- `/confirmation?reference=…` — receipt on success, **"Payment Confirming"
  pending state with auto-recheck polling + manual check button**, failure
  notice otherwise (never a blank page)
- `/payment-failed` — de-mocked, real transaction context
- `/dashboard` — voter overview
- `/history` — **real transaction history** (replaces the old static mock)

### Organizer (`/organizer/*`)
- `/dashboard` — metrics + quick actions (incl. live-results toggle)
- `/events` · `/events/new` · `/events/[eventId]` · `/events/[eventId]/details`
- `/nominees` · `/winners` — publish winners, **per-category close** buttons
  (closes only that category), "results announced" banner
- `/analytics` · `/settlements` — balance, payout account (bank name/account
  name/number + **bank code**, MoMo with `233…` hint), withdraw
- `/branding`, `/downloads`, `/share`, `/profile`

### Admin (`/admin/*`)
- `/login` · `/dashboard` — platform metrics (incl. pending withdrawals tally)
- `/events` — review/approve/reject queue
- `/organizations` · `/organizations/[id]`
- `/payments` · `/withdrawals` — approval queue with `pending` / `processing`
  badges and Mark-Paid fallback
- `/subscriptions` · `/reports` · `/support` — **real support tickets API**
  (replaces the old static mock) · `/users` · `/settings` · `/audit-logs`

> Removed in Aug 2026: `/admin/categories` and `/notifications` (orphaned mock
> pages with no backend backing).

---

## Key User Flows

1. **Vote** — assistant → nominee code → pick quantity → checkout → Paystack →
   confirmation (polling handles `pending` payments) → receipt.
2. **Results** — organizer sets visibility (`full` / `participants_only` /
   `hidden`); voters see live counts per that setting; **once the event closes,
   everyone sees full counts** on `/results`.
3. **Winners** — organizer previews exactly what voters see per visibility
   level, publishes winners, closes categories individually, and the results
   page shows winner badges.
4. **Payouts** — organizer saves a payout account on `/organizer/settlements`,
   requests a withdrawal; admin approves (auto-transfer when possible) or marks
   paid.

---

## API Client

`lib/api.ts` exports a configured axios instance plus typed modules:

- `authApi` — login / signup / logout / me
- `eventsApi` — public list, detail, results, create/update/delete, submit,
  close, reopen, mine
- `categoriesApi` — list/create/update/delete + `closeCategory`
- `nomineesApi` — by category, by code, leaderboard, by id, create/update/delete
- `paymentsApi` — initiate / verify / receipt / my transactions
- `organizerApi` — dashboard, analytics, votes, payments, publishWinners,
  settlements, payout-account, withdraw, profile
- `adminApi` — dashboard, orgs, users, events (approve/reject), nominees,
  payments, withdrawals (approve/mark-paid/reject), subscriptions, reports,
  support, audit-logs

**Behavior worth knowing:**
- Auth token is attached from `localStorage` automatically; 401 → clear token →
  redirect to `/login`; 403 → redirect to `/`.
- Non-idempotent requests (POST) are **never auto-retried**; network failures
  on GET/PUT/DELETE retry once after a 1s delay (guards against double payments
  and Render cold starts).
- `useWarmUp()` fires a `/health` ping so a sleeping backend has time to
  cold-start before the real request.

---

## Design System

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for tokens (Indigo/Emerald on Deep
Navy), typography, elevation, and component styling. The design system is
unchanged by the recent feature work.

---

## Troubleshooting

- **API calls fail / 502** — is the backend running on port 4000? Check
  `NEXT_PUBLIC_API_URL`. Render free instances sleep; the warm-up ping + retry
  logic usually handles it.
- **Redirected to `/login` unexpectedly** — token expired or missing; sign in
  again.
- **Paystack "invalid key"** — `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` must be the
  **public** key matching the backend's secret key (same Paystack account).
- **Port 3000 busy** — `npm run dev -- -p 3001`.
- **Stale build** — `rm -rf .next && npm run build`.

---

## Related

- Backend API & internals → [`../awards-platform-backend/README.md`](../awards-platform-backend/README.md)
- Recent changes → [`../CHANGELOG.md`](../CHANGELOG.md)
