# BladeBud — Stripe Checkout Preview setup

Branch: `fix/stripe-payment-hardening`  
Goal: test Stripe Checkout safely. Do **not** flip production to ACTIVE. Do **not** use live Stripe keys.

## 1. Separate Preview database (required)

Preview must **not** share Production `DATABASE_URL` / `DIRECT_URL`.

Recommended (Neon):

1. Neon Console → project → **Branches** → create branch `preview` from production (or a fresh empty DB).
2. Copy the branch **pooled** URL → Vercel Preview `DATABASE_URL`.
3. Copy the branch **direct** URL → Vercel Preview `DIRECT_URL`.
4. Confirm Production env vars still point at the production Neon branch only.

Until Preview uses a different host than Production, **do not** run Checkout tests on Preview.

## 2. Vercel → Project → Settings → Environment Variables

Add these for **Preview only** (not Production):

| Variable | Environment | Value |
| --- | --- | --- |
| `DATABASE_URL` | Preview | Neon **preview** pooled URL (`…-pooler…`, `sslmode=require&pgbouncer=true`) |
| `DIRECT_URL` | Preview | Neon **preview** direct URL |
| `AUTH_SECRET` | Preview | Unique secret (`openssl rand -base64 48`) — may already exist |
| `ADMIN_EMAIL` | Preview | Test admin email |
| `ADMIN_PASSWORD` | Preview | Long unique password (add if missing on Preview) |
| `NEXT_PUBLIC_SITE_URL` | Preview | The Preview URL after first deploy, e.g. `https://….vercel.app` (update once known) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Preview | `pk_test_…` |
| `STRIPE_SECRET_KEY` | Preview | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Preview | `whsec_…` from the Preview webhook endpoint |
| `PREVIEW_FORCE_BUSINESS_STATUS` | Preview | `ACTIVE` |

Optional Preview-only:

| Variable | Notes |
| --- | --- |
| `RESEND_API_KEY` / `EMAIL_FROM` | Leave empty to skip real email, or use a test mailbox |
| `TELEGRAM_*` | Prefer unset on Preview so test bookings do not ping production Telegram |

**Never** set `PREVIEW_FORCE_BUSINESS_STATUS` on Production. The code ignores it unless `VERCEL_ENV=preview`.

## 3. Stripe test webhook for Preview

1. Stripe Dashboard → **Test mode** (toggle).
2. Developers → **Webhooks** → **Add endpoint**.
3. Endpoint URL: `https://<preview-host>/api/stripe/webhook`
4. Events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
5. Copy **Signing secret** (`whsec_…`) → Vercel Preview `STRIPE_WEBHOOK_SECRET`.
6. After redeploy, send a test event from Stripe or complete a test card payment (`4242…`).

Local alternative (no Preview URL yet):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the printed `whsec_…` in `.env.local`.

## 4. Preview ACTIVE without touching production PRELAUNCH

Set Preview env `PREVIEW_FORCE_BUSINESS_STATUS=ACTIVE`.

`getSettings()` then resolves ACTIVE only when `VERCEL_ENV=preview`. The Production `SiteSettings.businessStatus` row stays **PRELAUNCH**.

## 5. Deploy gate

1. Confirm Preview DB ≠ Production DB.
2. Add Preview Stripe test env vars + `PREVIEW_FORCE_BUSINESS_STATUS`.
3. Approve a Preview deployment of this branch (Git push Preview or `vercel deploy` **without** `--prod`).
4. Open Preview `/en/book`, pay with Stripe test card, confirm a `BookingPayment` row in the **preview** DB only.
