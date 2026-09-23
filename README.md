# SIT WITH ME

A one-page booking site for a Bangalore platonic companionship service, plus a private admin panel.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind · Supabase (Postgres, Auth, Storage) · Vercel.

---

## 1. What you're deploying

- **Public page** (`/`): hero, companion cards (from DB), how it works, pricing (from DB), do/don't, safety, booking form, FAQ, floating WhatsApp button, footer.
- **Admin panel** (`/admin`): email+password login (no public sign-up), bookings table with stats/filters/CSV export, per-booking status + internal notes + amount paid + "would rebook", and screens to manage companions and pricing without touching code.
- **Security:** Supabase Row Level Security. The public can only insert bookings and read *visible* companions/pricing. Only the 2 admin accounts you create can read/update bookings or manage content.

---

## 2. Accounts you need to create (do this first)

1. **Supabase** — [supabase.com](https://supabase.com) → New project (pick a region near India, e.g. Singapore). Save your database password somewhere safe.
2. **Vercel** — [vercel.com](https://vercel.com) → sign up with GitHub.
3. **GitHub** — a repo to hold this code (Vercel deploys from Git).
4. **(Optional) Resend** — [resend.com](https://resend.com) free tier, only if you want email alerts on new bookings. Skip this and bookings still work fine; you'll just check `/admin` instead of your inbox.

---

## 3. Set up Supabase

1. In your Supabase project, go to **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates all tables, RLS policies, the photo storage bucket, and seeds 2 placeholder companions + 2 pricing plans.
2. **Create your 2 admin logins:**
   - Go to **Authentication → Users → Add user** (create user), and add both admin email addresses with a password each. Untick "auto confirm" only if you want to verify by email — for speed, tick **Auto Confirm User**.
   - Then go back to **SQL Editor** and run:
     ```sql
     update admin_users set email = 'youradmin1@realaddress.com' where email = 'admin1@example.com';
     update admin_users set email = 'youradmin2@realaddress.com' where email = 'admin2@example.com';
     ```
     (Or just delete the placeholder rows and `insert into admin_users (email) values ('you@realaddress.com');` for each real admin — the email here **must exactly match** the email you used to create the Auth user.)
3. **Get your API keys:** Project Settings → API.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY` — **never** put this in `NEXT_PUBLIC_...` or commit it. It's only used server-side to save bookings and check the spam rate-limit.

---

## 4. Run it locally (optional but recommended before deploying)

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in the 3 Supabase values from step 3, plus:
- `NEXT_PUBLIC_WHATSAPP_NUMBER=919310891615` (public floating button — no `+`, no spaces)
- `NOTIFY_EMAIL=magotraraghav02@gmail.com`
- `RESEND_API_KEY=` (leave blank to skip email alerts)

```bash
npm run dev
```

Visit `http://localhost:3000` for the public page and `http://localhost:3000/admin` for the admin panel (sign in with one of the admin accounts you created).

---

## 5. Deploy to Vercel

1. Push this project to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SIT WITH ME"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sit-with-me.git
   git push -u origin main
   ```
2. In Vercel: **Add New → Project → Import** your `sit-with-me` repo.
3. Under **Environment Variables**, add the same 6 keys from your `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NOTIFY_EMAIL`, `RESEND_API_KEY` (blank is fine).
4. Click **Deploy**. Vercel gives you a live `https://sit-with-me-xxxx.vercel.app` URL within a minute or two.
5. Visit `/admin` on the live URL and confirm you can log in with your admin account.
6. **(Optional) Custom domain:** Vercel → Project → Settings → Domains → add your domain and follow the DNS instructions from your registrar.

If you ever change environment variables in Vercel, redeploy (Vercel → Deployments → ⋯ → Redeploy) for them to take effect.

---

## 6. Enabling email alerts (optional)

1. Sign up at [resend.com](https://resend.com), verify your account.
2. Create an API key (Resend dashboard → API Keys).
3. Add it as `RESEND_API_KEY` in Vercel's environment variables and redeploy.
4. The free Resend tier sends from `onboarding@resend.dev` by default, which works immediately with no domain setup. To send from your own domain later, verify it in Resend and update the `from` address in `src/lib/email.ts`.

Without this key, bookings still save correctly — you just check `/admin` instead of getting an email.

---

## 7. Final checklist before going live

Replace all of these with your real details:

- [ ] **Brand name** — currently "SIT WITH ME" throughout `src/app/layout.tsx` (page title/description) and `src/components/Footer.tsx`.
- [ ] **Companion photos** — go to `/admin/companions`, upload a real photo for each companion (the seeded companions start with no photo).
- [ ] **Companion details** — edit the 2 seeded companions (Aisha, Rohan) in `/admin/companions`, or add your real companions and hide/delete the placeholders.
- [ ] **Pricing** — confirm ₹699 / ₹1,799 in `/admin/pricing`, or update to your real rates.
- [ ] **Public WhatsApp number** — `NEXT_PUBLIC_WHATSAPP_NUMBER` env var (floating button). Currently set to `919310891615`.
- [ ] **Admin reference WhatsApp number** — `ADMIN_WHATSAPP_NUMBER` env var, for your own records only (not shown publicly). Currently `918618141090`.
- [ ] **Notification email** — `NOTIFY_EMAIL` env var. Currently `magotraraghav02@gmail.com`.
- [ ] **Instagram link** — `src/components/Footer.tsx`, replace `YOUR_HANDLE`.
- [ ] **Admin accounts** — the 2 real admin emails must be created in Supabase Auth **and** match rows in the `admin_users` table (step 3.2 above).
- [ ] **Tele-MANAS crisis line** stays as-is (14416) — this is a real, free, 24/7 Indian mental health helpline; don't remove it.

---

## Notes on the spam protection

The booking form has:
- A **honeypot field** (hidden from real visitors; if it's filled in, the submission is silently dropped).
- A **time-trap** (rejects submissions completed in under ~2.5 seconds — too fast for a human).
- A **rate limit**: max 3 booking requests per WhatsApp number per 15 minutes, checked server-side against the database.

This is intentionally simple ("basic spam protection" per the brief). If spam becomes a real problem later, add a CAPTCHA (e.g. Cloudflare Turnstile) in front of the form.

## Project structure

```
src/
  app/
    page.tsx              → public one-page site
    actions.ts             → server action: validates + rate-limits + saves a booking
    admin/                 → login, bookings dashboard, companions & pricing management
  components/              → public page sections + admin UI pieces
  lib/
    supabase/               → browser / server / service-role Supabase clients
    types.ts, validation.ts, email.ts, csv.ts
supabase/
  schema.sql                → run once in the Supabase SQL editor
```
