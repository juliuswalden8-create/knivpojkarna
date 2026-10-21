# BladeBud

Premium knife sharpening website for a Marbella-based service founded by two Swedish entrepreneurs.

**BladeBud — Sharp knives. Zero hassle.**

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (Neon recommended; local Docker Postgres supported)
- English + Spanish, with Swedish prepared for a later launch

## Setup

```bash
cp .env.example .env
# set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d   # local PostgreSQL
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Production database and Vercel steps: see `PRODUCTION_SETUP.md`. Launch blockers: see `LAUNCH_AUDIT.md`.

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## What you can do in admin

- Switch business status: **PRELAUNCH** (interest only), **ACTIVE** (booking requests), **PAUSED** (no new requests)
- View pickup/return requests and update operational stages (confirmation is blocked while PRELAUNCH)
- Manage business quote inquiries
- Edit package prices
- Edit service areas
- Set open weekdays, time windows and blocked dates
- Update the WhatsApp number and pre-filled messages
- View monthly estimated revenue from completed jobs
- Export bookings as CSV

Public submissions are stored as **NEW requests**. They are not confirmed appointments. Payments are not implemented. Email templates are ready (Resend) and stay off until `RESEND_API_KEY` and `EMAIL_FROM` are set.

Default site mode is **PRELAUNCH**: customers can register interest, no appointment is confirmed, and no payment is collected. Change this in Admin → Settings.

See `LAUNCH_AUDIT.md` for launch blockers, credentials and remaining work.

## Production notes

See `PRODUCTION_SETUP.md`. In short: Neon Postgres, `prisma migrate deploy` (never `db push`), unique `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://www.bladebud.com` (not a `*.vercel.app` host), contact details in Admin → Settings, keep **PRELAUNCH** until equipment is ready.
