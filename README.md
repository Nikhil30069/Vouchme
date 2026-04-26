# HireEco — Profile Score Match

A transparent hiring ecosystem with three roles in one account:

- **Seeker** — track requirements, build a karma score reviewed by senior peers
- **Referrer** — score candidates you'd vouch for and grow your influence
- **Recruiter** — discover the top 3 karma-ranked candidates per opening

A user can hold any combination of roles. After Google sign-in the app prompts you
to pick which workspace to open, and you can switch between them at any time from
the avatar menu (Gmail-style).

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Zustand for client state
- Supabase (Postgres + Auth + Storage)

## 1. Set up a fresh Supabase project

1. Create a new project in [Supabase](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and run it. This creates all tables, triggers, RLS policies, RPCs and the
   `resumes` storage bucket.
3. Go to **Authentication → Providers** and enable **Google**:
   - Add your Google OAuth client ID and secret
     ([Google Cloud Console docs](https://supabase.com/docs/guides/auth/social-login/auth-google)).
   - Under **Authentication → URL Configuration** set:
     - **Site URL**: `http://localhost:5173`
     - **Additional redirect URLs**: `http://localhost:5173`
       (and your production URL once deployed).
4. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.

## 2. Configure the frontend

```sh
cp .env.example .env
```

Then edit `.env`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 3. Install and run

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with Google.

## Folder structure

```
src/
  components/
    auth/             # Landing + Google sign-in, onboarding, role picker
    dashboard/        # Layout, role switcher, role-specific dashboards
    ui/               # shadcn/ui primitives
  stores/             # Zustand stores
  integrations/
    supabase/         # Supabase client and generated types
supabase/
  schema.sql          # Single-shot SQL for a fresh project
```

## Multi-role model

`profiles.roles` is `TEXT[]` containing any of `seeker | recruiter | referrer`.
On first login the user is taken through onboarding to pick their roles.
The Zustand `authStore` tracks an `activeRole` that drives which dashboard the
app renders. Roles can be added at any time from the avatar's role switcher.

## Deployment notes

- Add your production origin to **Authentication → URL Configuration → Redirect URLs**
  in Supabase before going live.
- Resume uploads go to the public `resumes` storage bucket. If you need stricter
  privacy, change the bucket to non-public and serve via signed URLs.
