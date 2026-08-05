# 🎯 LiquidVotes — Quick Start Guide

> **Updated Aug 2026.** This is a **full-stack app**: the Next.js frontend talks
> to the LiquidVotes backend (Express + Prisma + Paystack). Earlier versions of
> this guide described a Supabase-only scaffold — that setup is obsolete.

## What You Have

- **`awards-platform-backend`** — REST API (auth, events, votes, payments,
  webhook, settlements, admin). Port **4000**.
- **`awards-platform-frontend (3)`** — Next.js 16 web app. Port **3000**.

## 🚀 Quick Start (5 minutes)

### 1️⃣ Start the backend

```bash
cd awards-platform-backend
cp .env.example .env            # fill in real values (DB, JWT, Paystack, Supabase)
npm install
npx prisma migrate deploy       # apply migrations (safe — never `migrate dev`)
npx prisma generate
npm run dev                     # → http://localhost:4000
```

Verify: `curl http://localhost:4000/health` → `{"status":"ok"}`

### 2️⃣ Start the frontend

```bash
cd "../awards-platform-frontend (3)"
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                     # → http://localhost:3000
```

### 3️⃣ Smoke-test the flows

1. Create an account (`/signup`, pick **Organizer**), log in.
2. Create an event, add categories + nominees, submit for review.
3. Approve the event from the **admin** side (`/admin/login` — seed or promote
   an admin user in the DB).
4. Vote as a voter via the nominee code; pay with a **Paystack test card**
   (`4084 0840 8408 4081`, any future expiry, any CVV).
5. Check the confirmation page, then results on `/results?eventId=…`.

## 🔐 Authentication

JWT-based, handled by the backend:

- Sign up / log in → backend returns `{ token, user }` → stored in
  `localStorage` → attached as `Authorization: Bearer <token>`.
- On 401 the app clears the token and redirects to `/login`.

## 📚 Docs

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Full overview, page map, flows, API client |
| [`SETUP.md`](./SETUP.md) | Detailed setup, env vars, troubleshooting |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Design tokens & components |
| [`../awards-platform-backend/README.md`](../awards-platform-backend/README.md) | Backend API reference |
| [`../awards-platform-backend/MIGRATIONS.md`](../awards-platform-backend/MIGRATIONS.md) | Safe DB migration workflow |
| [`../CHANGELOG.md`](../CHANGELOG.md) | All recent changes |

## ✅ Verification Checklist

- [ ] Backend responds on `http://localhost:4000/health`
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Homepage CTAs: Cast Your Vote → `/voter/assistant`, Browse Awards →
      `/awards`, Host an Event → `/signup`
- [ ] Navigation + footer visible on every page (about, contact, terms, …)
- [ ] Can create an event, submit for review, approve as admin
- [ ] Can vote + pay via Paystack test card and see the receipt
- [ ] Closing an event reveals full results on `/results`

## 🛠️ Common Commands

```bash
# Frontend
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint

# Backend
npm run dev        # dev server
npm run build      # tsc → dist/
npx prisma migrate deploy   # apply DB migrations (never `migrate dev`)
npx prisma generate         # regenerate client
```

## 🐛 Troubleshooting

| Symptom | Fix |
|---|---|
| API errors / blank data | Is the backend running? Check `NEXT_PUBLIC_API_URL`. |
| Redirected to `/login` | Token expired — sign in again. |
| Paystack errors | Public key must match the backend secret (same account). |
| Port 3000 busy | `npm run dev -- -p 3001` |
| Stale build | `rm -rf .next && npm run build` |
| `migrate dev` demands a reset | **Say no.** Use `migrate deploy` (see MIGRATIONS.md). |

## 🎉 Ready to Build!

You have a working full-stack voting platform:

- Pay-per-vote events with Paystack payments (webhook-verified)
- Live results with visibility controls (full / participants-only / hidden)
- Winner publishing + per-category close
- Organizer settlements & admin-approved withdrawals
- Real, API-backed history & support pages (no mock data)

**Start:** backend `npm run dev`, then frontend `npm run dev`, then visit
http://localhost:3000.
