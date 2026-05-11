# Google Calendar Booking — Deployment Guide

This replaces the Calendly integration with native Google Calendar booking. Three things need to be set up before the new flow works in production.

## 1. Run the SQL migration

Open the Supabase SQL Editor and run the new "Google Calendar native booking" section from `supabase/schema.sql` (starts at the comment block `Google Calendar native booking`). It creates:

- `oauth_credentials` table (RLS-locked, only Edge Functions can read)
- `profiles.availability_start / _end / _days / _timezone` columns
- `referral_requests.google_event_id` column
- `has_calendar_connected(uid)` function
- Partial unique index `uniq_rr_referrer_interview_active`
- Updated `find_eligible_referrers_for_job` that filters on calendar connection

## 2. Google Cloud OAuth client — enable Calendar scope

1. Go to https://console.cloud.google.com → APIs & Services → OAuth consent screen.
2. Add the scope `https://www.googleapis.com/auth/calendar.events` to the scope list. (Calendar API may also need to be enabled under "Enabled APIs".)
3. Under Credentials → your OAuth 2.0 client, confirm the authorized redirect URI matches the Supabase Auth callback (`https://<project-ref>.supabase.co/auth/v1/callback`).

You do **not** need to publish the app to "Production" verification just for `calendar.events`. It is a sensitive scope but Google permits it in Testing mode with up to 100 users.

## 3. Set Edge Function secrets

The Edge Functions need the Google OAuth client credentials (used server-side to mint fresh access tokens from each referrer's refresh token).

```bash
supabase secrets set GOOGLE_OAUTH_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
supabase secrets set GOOGLE_OAUTH_CLIENT_SECRET=<your-client-secret>
```

(`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

## 4. Deploy the Edge Functions

```bash
supabase functions deploy gcal-list-slots
supabase functions deploy gcal-book-slot
```

## 5. Test end-to-end

1. Open the app, sign in with Google as a referrer.
2. Go to the referrer dashboard → "Calendar & Availability" panel.
3. Click "Connect Google Calendar". Grant the calendar permission.
4. Set your working hours (default: 10:00–19:00 IST Mon–Fri).
5. From another browser, sign in as a seeker and book an interview.
6. You should see open slots from your real Google Calendar availability.
7. Booking a slot creates a calendar event with Google Meet on the referrer's calendar and saves `interview_at` automatically.

## Architecture notes

- **On-demand queries**: FreeBusy is called only when a seeker opens the booking modal — not on any schedule. Each call returns 7 days of data in one request, so one booking attempt = one quota unit. Free tier is 1M/day.
- **Token security**: Google refresh tokens are stored in `oauth_credentials` with RLS that blocks all SELECTs. Only the Edge Functions (running with `SUPABASE_SERVICE_ROLE_KEY`) can read them. Clients never see the refresh token after the initial OAuth callback.
- **Double-booking prevention**: A partial unique index on `(referrer_id, interview_at)` blocks two seekers from booking the same slot. The book-slot function rolls back the Google event if the DB insert fails.
- **Server-side slot validation**: `isSlotValid` re-checks the slot against the referrer's availability window in the Edge Function — a client cannot bypass working hours by tampering with the request body.
