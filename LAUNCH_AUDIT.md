# KNIVPOJKARNA UF — Launch audit

Date: 2026-10-12 (updated after pickup & delivery booking sprint)

Status values: **Working** / **Partial** / **Missing** / **Unknown**.  
P0 = required before a public URL. P1 = important, not launch-blocking for pre-launch. P2 = after launch.

| Feature | Current implementation | Status | Priority | Required action | How to verify |
| --- | --- | --- | --- | --- | --- |
| Framework & project structure | Next.js 16.4 App Router, TypeScript, Tailwind 4, Prisma 6. | Working | P2 | Keep. | `npm run typecheck` and `npm run build`. |
| Frontend routes & components | EN/ES public site, admin under `/admin`. Branding unchanged. | Working | P2 | Keep. | `/en`, `/es`, logo, CEO portrait. |
| Backend / API | Server actions `submitBooking`, `submitInquiry`, admin actions. No payments. | Working | P1 | Keep. | Submit a form; row appears in admin. |
| Database | Prisma schema is **PostgreSQL**. Migration `20261012160000_init`. SQLite `prisma/dev.db` preserved + backup/export. | Partial | P0 | Create Neon DB, set `DATABASE_URL` + `DIRECT_URL`, run `prisma migrate deploy`. Do not `db push` in production. | `npx prisma migrate deploy` against Neon; submit interest; redeploy; row still there. |
| Auth | JWT cookie `kp_admin`, httpOnly, sameSite=lax, secure in production, path `/admin`. Session must match an AdminUser row. | Working | P0 | Unique `AUTH_SECRET` in production. | Login; unauthenticated `/admin/bookings` redirects; logged-out CSV redirects. |
| Admin inquiries | Search, status + date filters, household & business detail pages, notes, PRELAUNCH status limits, CSV for both. | Working | P0 | Use it. Do not mark jobs confirmed in PRELAUNCH. | Filter, open a record, save notes, export CSV. |
| Booking & business forms | Household 4-step pickup flow: package, customer+address, pickup prefs (PRELAUNCH: no date), summary. Always PICKUP. Writes verified before success. Duplicate-click window 2 min. | Working | P0 | Keep PRELAUNCH. | Success page only after persist; admin shows NEW. |
| Business status | PRELAUNCH default. PAUSED rejects new submits. ACTIVE still stores NEW. | Working | P0 | Do not switch to ACTIVE until equipment is ready. | Admin → Settings. |
| Email | Resend via fetch. EN/ES templates for interest, request, pickup confirmed, collected, sharpened, return, completed. Failures logged, bookings kept. Inactive until `RESEND_API_KEY` + `EMAIL_FROM`. | Partial | P1 | Buy domain, create mailbox, set env, send a test. | Admin booking detail → Email log. |
| Pricing | €7 / €18 / €27 / €49. | Working | P1 | Confirm in Admin → Packages. | `/en/prices` |
| Service area | Central list: Marbella, San Pedro de Alcántara, Nueva Andalucía, Puerto Banús, Mijas Costa, Fuengirola + in-corridor free text. Outside-area interest allowed, no confirmed pickup. Postal/drop-off not offered. | Working | P0 | Keep copy aligned. | Booking town list includes other neighbourhood / outside. |
| i18n | EN + ES. | Working | P2 | Swedish later. | Language switcher. |
| Env / secrets | `.env.example` documents Postgres URLs. `.env*` gitignored except example. No `NEXT_PUBLIC_` secrets. | Partial | P0 | Fill production env. | Host dashboard (do not paste secrets). |
| Hosting | `vercel.json` runs generate + `migrate deploy` + seed + `next build`. No Git remote and no Vercel project yet. | Missing | P0 | Push to GitHub, import on Vercel, set env, deploy. | Open the `*.vercel.app` URL; submit interest; row remains after reload. |
| Privacy | UF legal name, consent, cookies. Contact email shows only when configured. | Partial | P0 | Save a public email in Settings. | Footer mailto only after save. |
| SEO | Canonicals, sitemap, robots, JSON-LD for launch towns. Needs live `NEXT_PUBLIC_SITE_URL`. | Partial | P0 | Set live URL. | View source after deploy. |
| Rate limit | In-memory + `RateLimit` table for serverless. Honeypot field on forms. | Working | P1 | Confirm after Neon is live. | Burst submits return rate error. |
| Payments | None. | Working (absent) | P2 | Do not add for launch. | `package.json` has no Stripe. |
| Tests | Node tests for schemas, PRELAUNCH/PAUSED, statuses, service area, email copy, CSV, filters, persistence. | Working | P1 | Run `npm test`. Neon migrate still unverified here. | `npm test` |

## Done in this sprint

- Pickup-and-return-only customer booking flow (4 steps). PRELAUNCH collects interest without a firm date.
- Operational admin statuses with explicit mapping CONFIRMED→PICKUP_CONFIRMED and IN_PROGRESS→SHARPENING.
- Service-area resolver: listed towns, corridor neighbourhoods, outside-area interest.
- Resend templates (EN/ES) and EmailLog. Sending skipped without credentials.
- Configurable pickup/return instructions and pickup fee (null = not free).
- Duplicate-click protection (pending button + 2-minute same email/package/address window).

## Still required from the owners

1. Neon credentials; run `prisma migrate deploy` (includes `20261012180000_pickup_ops`).
2. Temporary Vercel URL in `NEXT_PUBLIC_SITE_URL` (no custom domain yet).
3. Create professional mailbox, preferably `info@knivpojkarna.com`, and save it in Admin → Settings.
4. Production `AUTH_SECRET`.
5. WhatsApp number.
6. Keep PRELAUNCH until equipment is ready. Do not switch to ACTIVE yet.
7. Decide pickup/return fee (leave empty until decided — do not advertise as free).
8. Resend account + verified domain; set `RESEND_API_KEY` and `EMAIL_FROM`. Until then, email is implemented but not live.
9. Customer-facing pickup and return instruction copy in Settings (EN/ES).
10. Whether to import the existing local SQLite booking into Neon.
