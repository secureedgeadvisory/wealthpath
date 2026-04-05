# WealthPath — Go Live Checklist

> Follow these steps to move from mock data to production.

---

## Phase 1: Infrastructure

- [ ] **1. Create Supabase project**
  - Go to [supabase.com](https://supabase.com) → New Project
  - Region: choose closest to your users (e.g., Middle East for UAE)
  - Save the project URL and anon key

- [ ] **2. Run database migrations**
  - Open Supabase SQL Editor
  - Paste and run: `supabase/migrations/001_initial_schema.sql`
  - Verify all 8 tables created with RLS policies

- [ ] **3. Enable Supabase Auth**
  - Go to Authentication → Providers → Email
  - Enable "Magic Link" sign-in
  - Configure email templates (branded WealthPath design)
  - Set redirect URL: `https://yourdomain.com/auth/callback`

- [ ] **4. Configure environment variables**
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ANTHROPIC_API_KEY=sk-ant-your-key
  NEXT_PUBLIC_APP_URL=https://yourdomain.com
  ```

---

## Phase 2: Code Changes

- [ ] **5. Activate Claude API**
  - Open `/lib/claude.ts`
  - Change `const USE_MOCK = true` → `const USE_MOCK = false`
  - Test: path generation, daily briefings, consequence narration

- [ ] **6. Swap mock data for real Supabase queries**
  - Replace imports across pages:
    ```
    // Before (mock)
    import { MOCK_GOAL, MOCK_SELECTED_PATH, ... } from "@/lib/mock-data";

    // After (real)
    import { getUserGoal, getSelectedPath, ... } from "@/lib/supabase-real";
    ```
  - Key files to update:
    - `src/app/(app)/dashboard/page.tsx`
    - `src/app/(app)/journey/page.tsx`
    - `src/app/(app)/tasks/page.tsx`
    - `src/app/(app)/what-if/page.tsx`
    - `src/app/(app)/settings/page.tsx`
    - `src/app/(app)/paths/page.tsx`

- [ ] **7. Enable real auth**
  - Remove mock-auth bypass in `src/lib/supabase-middleware.ts`
  - Delete the early return when Supabase URL is placeholder
  - Test: unauthenticated → redirects to /login
  - Test: magic link email → callback → dashboard

- [ ] **8. Connect task generator to Supabase**
  - Save generated tasks to `daily_tasks` table
  - Set up a Supabase Edge Function or Vercel Cron to generate tasks daily at midnight

---

## Phase 3: Deploy

- [ ] **9. Deploy to Vercel**
  - Push to GitHub
  - Import in Vercel dashboard
  - Framework: Next.js (auto-detected)
  - Region: `dub1` (Dublin — closest to Dubai)

- [ ] **10. Set environment variables in Vercel**
  - Settings → Environment Variables
  - Add all 4 variables for Production + Preview

- [ ] **11. Configure custom domain**
  - Settings → Domains → Add `wealthpath.app` (or your domain)
  - Update DNS records
  - Update `NEXT_PUBLIC_APP_URL` to production URL
  - Update Supabase redirect URL to production domain

---

## Phase 4: Post-Launch

- [ ] **12. Set up daily task generation**
  - Option A: Supabase Edge Function triggered by pg_cron
  - Option B: Vercel Cron Job hitting `/api/generate-daily-tasks`
  - Schedule: midnight user's timezone

- [ ] **13. Enable email notifications**
  - Daily task reminders (8 AM)
  - Streak warning (9 PM)
  - Weekly summary (Sunday)
  - Milestone celebrations
  - Use Resend or Supabase email

- [ ] **14. Set up monitoring**
  - Vercel Analytics for performance
  - Supabase dashboard for DB metrics
  - Error tracking (Sentry recommended)

- [ ] **15. Stripe integration for Pro tier**
  - Set up Stripe subscription ($7.99/mo)
  - Webhook to update user tier in Supabase
  - Gate Pro features based on subscription status

---

## Verification Checklist

After go-live, test every flow:

- [ ] Landing page loads, CTA links work
- [ ] Magic link email sends and callback works
- [ ] Onboarding saves goal to Supabase
- [ ] AI generates 3 real paths via Claude
- [ ] Path selection saves to DB
- [ ] Daily tasks generated and displayed
- [ ] Task completion updates DB + recalculates journey
- [ ] Skip shows real AI consequence narration
- [ ] Streak persists across sessions
- [ ] Milestone celebration triggers at correct value
- [ ] Journey map reflects real portfolio data
- [ ] Settings changes persist
- [ ] Light/dark mode works
- [ ] PWA installs correctly
- [ ] Offline mode shows cached data
- [ ] Pro upgrade flow works (if Stripe connected)

---

*Estimated time: 4-6 hours for a developer familiar with the codebase.*
