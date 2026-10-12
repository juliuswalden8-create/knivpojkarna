# KNIVPOJKARNA UF — production setup (Neon + Vercel)

The Prisma schema targets **PostgreSQL**. The local SQLite file `prisma/dev.db` is **not deleted** and must not be deleted.

Do not run `prisma db push` against production. Use `prisma migrate deploy`.

Business status stays **PRELAUNCH** until you switch it in Admin → Settings. Do not buy a custom domain yet.

## 1. Create a Neon project

1. Open [https://console.neon.tech](https://console.neon.tech) and sign in.
2. Create a project named `knivpojkarna`.
3. Region: **Frankfurt (`eu-central-1`)** (closest practical region to Marbella).
4. Keep the default database name (`neondb`) unless you have a reason to change it.
5. Open **Dashboard → Connection details**.
6. Copy **two** connection strings:

| Neon label | App variable | How to recognise it |
| --- | --- | --- |
| Pooled / pooler | `DATABASE_URL` | Host contains `-pooler`. Add `sslmode=require` and `pgbouncer=true`. |
| Direct / non-pooler | `DIRECT_URL` | Host does **not** contain `-pooler`. Add `sslmode=require`. |

Placeholders only:

```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

Never put either value in a `NEXT_PUBLIC_*` variable. Do not paste them into chat, Git, or screenshots.

## 2. Apply migrations (only after the URLs exist)

From this repo, with the Neon URLs in your **shell** (not committed):

```bash
cd /path/to/knivpojkarna
export DATABASE_URL="postgresql://…"   # pooled
export DIRECT_URL="postgresql://…"     # direct
npx prisma migrate deploy
npx prisma db seed
```

`migrate deploy` applies:

1. `prisma/migrations/20261012160000_init`
2. `prisma/migrations/20261012180000_pickup_ops`

It does not drop data. Seed is idempotent: packages, launch areas, PRELAUNCH settings, and the first admin (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) if that user does not already exist.

Do **not** run `prisma migrate reset`, `prisma db push`, or `prisma db drop`.

Vercel will also run `migrate deploy` + seed on every production build (`vercel.json`).

## 3. Production admin

1. Generate a unique secret: `openssl rand -base64 48`
2. Set `AUTH_SECRET` to that value on Vercel. Do not reuse the local development secret.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on Vercel (long unique password).
4. First admin is created either by seed or by the first successful login when no admin row exists yet.
5. After login works, you can remove `ADMIN_PASSWORD` from Vercel if you prefer; keep `AUTH_SECRET`.

Production refuses an `AUTH_SECRET` that still contains `change-me`.

## 4. Vercel (temporary `*.vercel.app` URL)

No custom domain.

1. Put this project on GitHub (private repo is fine). Do **not** commit `.env`.
2. Import the repo at [https://vercel.com/new](https://vercel.com/new).
3. Framework: Next.js (detected). Region: Frankfurt (`fra1`) is set in `vercel.json`.
4. Build command is already in `vercel.json`:
   `prisma generate && prisma migrate deploy && npx tsx prisma/seed.ts && next build`
5. Add environment variables for **Production** and **Preview**:

| Variable | Public? | Required |
| --- | --- | --- |
| `DATABASE_URL` | No | Yes (Neon pooled) |
| `DIRECT_URL` | No | Yes (Neon direct) |
| `AUTH_SECRET` | No | Yes (unique) |
| `ADMIN_EMAIL` | No | Yes |
| `ADMIN_PASSWORD` | No | Yes (first admin) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes — use `https://<assigned>.vercel.app` |
| `WHATSAPP_NUMBER` | No | Optional |
| `CONTACT_EMAIL` | No | Optional |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Leave empty for now |

6. Deploy.
7. If Vercel assigned `knivpojkarna-xxx.vercel.app` instead of `knivpojkarna.vercel.app`, update `NEXT_PUBLIC_SITE_URL` to that exact https origin and redeploy.
8. After deploy: open `/en`, log in at `/admin/login`, confirm Overview shows **PRELAUNCH**, submit a test interest on `/en/book`, confirm the row in Household.

## 5. Optional: import local SQLite records

Only after step 2, and only if you want local development inquiries on Neon:

```bash
npx tsx scripts/import-postgres.ts
```

The importer skips rows that already exist. It does not delete. Skip this for a clean production database.

## 6. What this machine has not done

- Neon project was **not** created here (no production credentials in the environment).
- `prisma migrate deploy` was **not** run against Neon.
- The site is **not** deployed to Vercel (no Git remote, no Vercel project).
- Local `prisma/dev.db` was **not** modified or deleted.
