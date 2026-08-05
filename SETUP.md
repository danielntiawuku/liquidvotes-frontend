# Setup Guide — LiquidVotes (Full Stack)

> **Updated Aug 2026.** This app is now backed by the LiquidVotes API
> (`awards-platform-backend`). The old Supabase-only setup guide (SQL table
> scripts, RLS policies, Supabase Auth) is **obsolete** — the schema is managed
> by **Prisma** and auth is **JWT** via the backend.

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Environment Variables](#environment-variables)
6. [Database & Migrations](#database--migrations)
7. [Seed an Admin User](#seed-an-admin-user)
8. [Running Both Services](#running-both-services)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

```
Browser (Next.js :3000)  ──HTTP──▶  API (Express :4000)  ──Prisma──▶  PostgreSQL (Supabase)
                                          │
                                          ├── Paystack API (payments + transfers)
                                          ├── Paystack webhook (HMAC-verified)
                                          └── Supabase Storage (image uploads)
```

Two separate repositories (each its own git repo):

- `awards-platform-backend` — API + services
- `awards-platform-frontend (3)` — Next.js web app

---

## Prerequisites

- Node.js **18+**
- npm (the projects use npm scripts; pnpm is not required)
- A Supabase project (Postgres + Storage)
- A Paystack account (test mode is fine)

---

## Backend Setup

```bash
cd awards-platform-backend

npm install
cp .env.example .env
# Edit .env: DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
#            JWT_SECRET, PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, FRONTEND_URL

npx prisma migrate deploy     # apply migrations to your Supabase DB
npx prisma generate           # generate the Prisma client

npm run dev                   # → http://localhost:4000
```

**Never run `prisma migrate dev`** — it will demand a destructive reset. Full
details in [`../awards-platform-backend/MIGRATIONS.md`](../awards-platform-backend/MIGRATIONS.md).

---

## Frontend Setup

```bash
cd "../awards-platform-frontend (3)"

npm install
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:4000, plus the Paystack
# public key and app URLs.

npm run dev                   # → http://localhost:3000
```

---

## Environment Variables

### Backend (`.env`)
| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | ✅ | Supabase Postgres (pooler + direct) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Image uploads |
| `SUPABASE_ANON_KEY` | ✅ | Supabase client |
| `JWT_SECRET` | ✅ | Token signing |
| `PAYSTACK_SECRET_KEY` | ✅ | Payments + transfers |
| `PAYSTACK_PUBLIC_KEY` | ✅ | Public key reference |
| `FRONTEND_URL` | ✅ | CORS origin (frontend URL) |
| `PORT` | – | Default 4000 |
| `NODE_ENV` | – | development/production |

### Frontend (`.env.local`)
| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL |
| `NEXT_PUBLIC_APP_URL` | – | Public app URL |
| `NEXT_PUBLIC_APP_NAME` | – | App name (LiquidVotes) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | ✅ | Client-side checkout key |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | – | Assets |

---

## Database & Migrations

- Schema is defined in `prisma/schema.prisma` (backend repo).
- Apply with `npx prisma migrate deploy` (non-destructive, only runs new
  migrations).
- To change the schema: edit `schema.prisma`, hand-write a migration SQL file,
  then `migrate deploy`. See `MIGRATIONS.md` for the exact workflow.
- Models: `User · Subscription · Event · Category · Nominee · Vote · Payment ·
  SupportTicket · AuditLog · Withdrawal`.

---

## Seed an Admin User

There is no sign-up path for admin roles. To get an admin account:

```bash
cd awards-platform-backend
npx prisma studio     # or connect via psql
# Find your user row and set role = 'admin' (or 'super_admin')
```

Then log in at `/admin/login` with that account.

---

## Running Both Services

| Terminal | Command | URL |
|---|---|---|
| 1 | `cd awards-platform-backend && npm run dev` | http://localhost:4000 |
| 2 | `cd "../awards-platform-frontend (3)" && npm run dev` | http://localhost:3000 |

Production: backend `npm run build && npm start` (or Render), frontend
`npm run build && npm start` (or Vercel). Set `FRONTEND_URL` /
`NEXT_PUBLIC_API_URL` to the deployed URLs.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot connect` / Prisma errors | Check `DATABASE_URL` / `DIRECT_URL`; pooler sometimes drops the first connection — retry. |
| 401 loops in the app | Token missing/expired in `localStorage`; log in again. |
| 403 on admin routes | Account role isn't `admin` — promote it (see above). |
| Paystack checkout fails | Public key ≠ the account of the backend secret key. |
| Webhook not firing | Register `https://<host>/payments/webhook` in the Paystack dashboard; use a tunnel locally (`ngrok http 4000`). |
| CORS errors | `FRONTEND_URL` must match the frontend origin exactly. |
| Stale frontend | `rm -rf .next && npm run build`. |

---

## Related Docs

- [`README.md`](./README.md) — page map, flows, API client behavior
- [`QUICKSTART.md`](./QUICKSTART.md) — 5-minute setup
- [`../awards-platform-backend/README.md`](../awards-platform-backend/README.md) — full API reference
- [`../awards-platform-backend/MIGRATIONS.md`](../awards-platform-backend/MIGRATIONS.md) — migration workflow
- [`../CHANGELOG.md`](../CHANGELOG.md) — change log
