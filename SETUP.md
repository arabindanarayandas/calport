# Calport — going live

Do these in order. Each step says what to click. Nothing here needs coding.

## 1. Supabase: create the database

1. Open your `calport` project on supabase.com.
2. Left menu → **SQL Editor** → **New query**.
3. Open `supabase/migrations/0001_init.sql` from this repo, copy everything, paste it in, click **Run**.
   You should see "Success. No rows returned".
4. Left menu → **Authentication** → **URL Configuration**:
   - **Site URL:** `https://calport.ai`
   - **Redirect URLs:** add `https://calport.ai/auth/callback` and `http://localhost:3000/auth/callback`
5. **Authentication** → **Sign In / Providers** → **Email**: keep "Confirm email" **on**.
6. Left menu → **Project Settings** → **API Keys**. You need two values for Vercel:
   - **Project URL** (looks like `https://abcd.supabase.co`)
   - **Publishable key** (starts with `sb_publishable_`)
   Never share the **secret** key.

Supabase's built-in email only sends a handful of emails an hour. Before inviting students,
connect Resend (step 4).

## 2. Vercel: put the site online

1. vercel.com → **Add New… → Project** → pick the `calport` repo → **Import**.
2. Before clicking Deploy, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |
   | `NEXT_PUBLIC_SITE_URL` | `https://calport.ai` |
3. Click **Deploy**.
4. Project → **Settings → Domains** → add `calport.ai`. Vercel shows two DNS records;
   add them at your domain registrar.

## 3. Approving mentors

New mentors stay hidden until you approve them.
Supabase → **Table Editor** → `mentor_profiles` → find the row → set `approved` to `true`.
Set `tier` to `senior` (placed student) or `expert` (working professional).

## 4. Email through Resend

1. resend.com → **Domains** → add `calport.ai` → add the DNS records it shows.
2. resend.com → **API Keys** → create one.
3. Supabase → **Authentication → Emails → SMTP Settings** → turn on custom SMTP:
   host `smtp.resend.com`, port `465`, user `resend`, password = the Resend API key,
   sender `hello@calport.ai`.

## The rules built in

| Rule | Value | Where to change |
|---|---|---|
| Free sessions at sign-up | 2 | `settings` table, `signup_credits` |
| Free session per referral | 1, max 10 | `settings`, `max_referral_credits` |
| Referral counts when | friend's profile is complete **and** first practice graded | built in |
| Free sessions allowed with mentors charging | ₹999 or less | `settings`, `credit_price_cap_inr` |
| Mentor's free sessions before charging | 2 | `settings`, `mentor_free_sessions` |
| Calport fee | 25% (paid sessions 1–10), 20% (11–20), 10% after | built in |
| Calport pays mentor for a free session | price minus that fee; counts toward 10/20 | built in |
| Monthly budget for free sessions with paid mentors | ₹20,000 | `settings`, `monthly_budget_inr` (from next month) or `budget_months` (this month) |
| Free session back if cancelled | 24h+ ahead | `settings`, `cancel_refund_hours` |
| Two no-shows | booking paused 7 days | `settings`, `no_show_block_days` |

## Checking the rules

`python3 supabase/tests/test_rules.py` builds a scratch copy of the database and checks
every rule above (57 checks).
