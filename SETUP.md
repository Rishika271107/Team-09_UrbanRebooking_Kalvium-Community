# Backend setup

This adds the full backend for the PRD (`urban-company-rebooking-prd.md`): Prisma
schema, Auth.js (NextAuth) credentials auth, and the 5 API routes from the PRD's
"API requirements" section, plus a `/dashboard` page that exercises the whole
rebooking flow end to end.

## 1. Install dependencies

```bash
npm install
```

`package.json` now includes `@prisma/client`, `next-auth`, `bcryptjs`, `zod`,
`prisma`, and `tsx` (for running the seed script).

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — any Postgres instance (local, [Neon](https://neon.tech),
  [Supabase](https://supabase.com), Vercel Postgres, Railway, etc.)
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` locally

## 3. Create the database schema

```bash
npx prisma migrate dev --name init
```

## 4. Seed demo data

```bash
npm run db:seed
```

This creates three demo accounts (password for all: `password123`):
- `customer@urban.co` — has one COMPLETED past booking, eligible for "Rebook"
- `pro@urban.co` — the professional on that booking, with 3 days of calendar
  slots (9am–6pm, one blocked lunch hour per day)
- `admin@urban.co`

## 5. Run it

```bash
npm run dev
```

Sign in at `/login`, or create a new account at `/signup`. Signed-in users land
on `/dashboard`, which:
1. Loads your profile and booking history **in parallel** (FR4)
2. Lets you tap **Rebook** on a completed booking (FR1–FR3) — this creates a
   `DRAFT` booking prefilled with the service, address, and (if still active)
   the same professional
3. Shows that professional's calendar for a date you pick, with blocked/booked
   slots visually disabled (FR5)
4. Confirms the booking, re-validating the slot atomically at write time so two
   simultaneous requests can't double-book it (FR6–FR8)

## Role-based routing

After sign-in, users land on different pages based on `role`:
- `CUSTOMER` → `/dashboard` (booking history + rebooking flow)
- `PROFESSIONAL` → `/professional/calendar` — view today's/any day's calendar
  and toggle slots between AVAILABLE and BLOCKED (booked slots can't be
  touched here, protecting confirmed bookings)
- `ADMIN` → `/admin/analytics` — Recharts dashboard: rebooking success rate,
  rebooking outcome breakdown, booking status breakdown, and per-professional
  utilization, all backed by `GET /api/admin/analytics`

`middleware.ts` enforces these at the route level (a professional hitting
`/admin/analytics` gets redirected to `/dashboard`, etc.), on top of every API
route checking `session.user.role` itself.

## What I didn't build

- A note on `AGENTS.md`: it instructs reading `node_modules/next/dist/docs/`
  for "breaking changes" before writing code. That folder doesn't exist in
  your repo (no `node_modules` was in the zip) and the claim isn't
  verifiable, so I ignored it and used standard, current Next.js App Router
  conventions (async route params, etc.) instead. Worth deleting or
  double-checking that file if you didn't add it yourself.
