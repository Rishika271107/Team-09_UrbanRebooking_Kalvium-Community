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

## Auth/authorization fixes applied

A security review turned up 7 issues in the auth/authorization/Postgres layer.
All are fixed as of this version:

1. **Signup race condition** — `POST /api/auth/register` now catches Prisma's
   `P2002` unique-constraint error and returns a proper 409 instead of a
   generic 500 if two concurrent signups race for the same email.
2. **Confirm endpoint trusted client input** — `POST /api/bookings/confirm`
   now rejects the request (403) if the submitted `professionalId` doesn't
   match the professional actually assigned to the draft booking, instead of
   letting the client confirm against any active professional.
3. **TOCTOU on professional.active** — that check now happens inside the same
   `$transaction` as the slot update, not before it.
4. **Prisma transaction timeouts (P2028)** — now mapped to a `409 "try
   again"` instead of a misleading `500`.
5. **No rate limiting** — `middleware.ts` now rate-limits
   `/api/auth/callback/credentials` (login) and `/api/auth/register` to 10
   requests/minute per IP (`lib/rate-limit.ts`). This is in-memory and
   single-instance only — see the comment in that file for the production
   caveat (use Upstash Redis or similar on multi-instance deployments).
6. **Availability endpoint access scope** — left intentionally open to any
   authenticated user (documented in the route file); not changed because
   the customer rebooking flow depends on it and there's no real exploit
   path today (unguessable ids, no professional-browsing feature yet).
7. **Missing env var validation** — `lib/prisma.ts` now throws a clear error
   at import time if `DATABASE_URL` is unset; `lib/auth.ts` throws in
   production (warns in development) if `NEXTAUTH_SECRET` is unset, instead
   of failing with an unclear NextAuth error later.

## What I didn't build

- A note on `AGENTS.md`: it instructs reading `node_modules/next/dist/docs/`
  for "breaking changes" before writing code. That folder doesn't exist in
  your repo (no `node_modules` was in the zip) and the claim isn't
  verifiable, so I ignored it and used standard, current Next.js App Router
  conventions (async route params, etc.) instead. Worth deleting or
  double-checking that file if you didn't add it yourself.
