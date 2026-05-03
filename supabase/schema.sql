-- =====================================================================
-- HireEco - Profile Score Match Platform
-- Single-shot schema for a fresh Supabase project.
--
-- HOW TO USE:
--   1. Open the SQL editor in your new Supabase project.
--   2. Paste this entire file and run it.
--   3. In Authentication -> Providers, enable Google and add your
--      OAuth client id / secret. Set Site URL + Redirect URLs to your
--      app origin (e.g. http://localhost:5173).
--   4. Update .env in the frontend with the new project URL + anon key.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- profiles
-- One row per authenticated user. Created automatically via trigger.
-- A single user can hold multiple roles: 'seeker' | 'recruiter' | 'referrer'.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "workExperience" JSONB,
  total_experience_years INTEGER,
  organizations TEXT[],
  current_organization TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row when a new auth user signs up via Google.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- job_requirements
-- Used by both seekers (their wishlist / what they want) and referrers
-- (the role/level they can vouch for). Type discriminates.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('seeker', 'referrer', 'recruiter')),
  role TEXT NOT NULL,
  "yearsOfExperience" INTEGER NOT NULL,
  "currentCtc" INTEGER,
  "expectedCtc" INTEGER,
  "salaryBracketMin" INTEGER,
  "salaryBracketMax" INTEGER,
  "noticePeriod" INTEGER,
  "readyToJoinIn" INTEGER,
  "resumeUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- job_postings
-- A recruiter's open role.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  role TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- scoring_parameters
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scoring_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_score INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.scoring_parameters (name, description, weight) VALUES
  ('Technical Abilities', 'Technical skills and problem-solving capabilities', 1.00),
  ('Cultural Fit', 'Ownership, energy and communication', 1.00)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------
-- referral_requests
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_requirement_id UUID REFERENCES public.job_requirements(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  seeker_experience_years INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'scored')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (seeker_id, referrer_id, job_requirement_id)
);

-- ---------------------------------------------------------------------
-- scores
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_request_id UUID NOT NULL REFERENCES public.referral_requests(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES public.scoring_parameters(id) ON DELETE CASCADE,
  score DECIMAL(4, 2) NOT NULL CHECK (score >= 0.00 AND score <= 10.00),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (referral_request_id, parameter_id)
);

-- ---------------------------------------------------------------------
-- strength_scores (cached snapshot per seeker job_requirement)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.strength_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_requirement_id UUID UNIQUE REFERENCES public.job_requirements(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  avg_score DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  total_scores INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- candidate_matches
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strength_score DECIMAL(4, 2),
  is_interested BOOLEAN NOT NULL DEFAULT FALSE,
  phone_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_posting_id, seeker_id, recruiter_id)
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_referral_requests_seeker ON public.referral_requests(seeker_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_referrer ON public.referral_requests(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_status ON public.referral_requests(status);
CREATE INDEX IF NOT EXISTS idx_scores_referral_request ON public.scores(referral_request_id);
CREATE INDEX IF NOT EXISTS idx_scores_seeker ON public.scores(seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter ON public.job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_role ON public.job_postings(role);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_job ON public.candidate_matches(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_seeker ON public.candidate_matches(seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_requirements_user ON public.job_requirements("userId");
CREATE INDEX IF NOT EXISTS idx_job_requirements_role ON public.job_requirements(role);
CREATE INDEX IF NOT EXISTS idx_strength_scores_seeker ON public.strength_scores(seeker_id);

-- ---------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------

-- Cumulative strength score: SUM(score * weight) / COUNT(DISTINCT referrer)
CREATE OR REPLACE FUNCTION public.calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4, 2) AS $$
DECLARE
  total_weighted DECIMAL(10, 2);
  unique_referrers INTEGER;
BEGIN
  SELECT COALESCE(SUM(s.score * sp.weight), 0.00)
    INTO total_weighted
  FROM public.scores s
  JOIN public.scoring_parameters sp ON s.parameter_id = sp.id
  WHERE s.seeker_id = seeker_uuid AND sp.is_active = TRUE;

  SELECT COUNT(DISTINCT s.referrer_id)
    INTO unique_referrers
  FROM public.scores s
  WHERE s.seeker_id = seeker_uuid;

  IF unique_referrers > 0 THEN
    RETURN ROUND(total_weighted / unique_referrers, 2);
  END IF;
  RETURN 0.00;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find referrers eligible for a given seeker job_requirement.
CREATE OR REPLACE FUNCTION public.find_eligible_referrers_for_job(job_requirement_uuid UUID)
RETURNS TABLE (
  referrer_id UUID,
  referrer_name TEXT,
  referrer_role TEXT,
  referrer_experience INTEGER,
  organization TEXT,
  total_experience_years INTEGER,
  organizations TEXT[],
  current_organization TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    jr.role,
    jr."yearsOfExperience",
    (p."workExperience"->>'organization')::TEXT,
    p.total_experience_years,
    p.organizations,
    p.current_organization
  FROM public.profiles p
  INNER JOIN public.job_requirements jr
    ON jr."userId" = p.id AND jr.type = 'referrer'
  INNER JOIN public.job_requirements seeker_jr
    ON seeker_jr.id = job_requirement_uuid
  WHERE 'referrer' = ANY (p.roles)
    AND lower(trim(jr.role)) = lower(trim(seeker_jr.role))
    AND jr."yearsOfExperience" > seeker_jr."yearsOfExperience" + 1
    AND NOT EXISTS (
      SELECT 1 FROM public.referral_requests rr
      WHERE rr.seeker_id = seeker_jr."userId"
        AND rr.referrer_id = p.id
        AND rr.job_requirement_id = job_requirement_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backwards-compatible signature used elsewhere in the app.
CREATE OR REPLACE FUNCTION public.find_eligible_referrers(seeker_role TEXT, seeker_experience INTEGER)
RETURNS TABLE (
  referrer_id UUID,
  referrer_name TEXT,
  referrer_role TEXT,
  referrer_experience INTEGER,
  organization TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    jr.role,
    jr."yearsOfExperience",
    (p."workExperience"->>'organization')::TEXT
  FROM public.profiles p
  INNER JOIN public.job_requirements jr
    ON jr."userId" = p.id AND jr.type = 'referrer'
  WHERE 'referrer' = ANY (p.roles)
    AND lower(trim(jr.role)) = lower(trim(seeker_role))
    AND jr."yearsOfExperience" > seeker_experience + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Top candidates for a job posting.
CREATE OR REPLACE FUNCTION public.get_top_candidates(
  job_posting_uuid UUID,
  limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
  seeker_id UUID,
  seeker_name TEXT,
  seeker_role TEXT,
  seeker_experience INTEGER,
  strength_score DECIMAL(4, 2),
  total_scores INTEGER,
  expected_ctc INTEGER,
  current_ctc INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    jr.role,
    jr."yearsOfExperience",
    COALESCE(ss.avg_score, 0.00),
    COALESCE(ss.total_scores, 0),
    jr."expectedCtc",
    jr."currentCtc"
  FROM public.job_postings jp
  JOIN public.job_requirements jr
    ON jr.type = 'seeker'
    AND lower(trim(jr.role)) = lower(trim(jp.role))
  JOIN public.profiles p
    ON p.id = jr."userId" AND 'seeker' = ANY (p.roles)
  LEFT JOIN public.strength_scores ss
    ON ss.job_requirement_id = jr.id
  WHERE jp.id = job_posting_uuid
    AND jr."yearsOfExperience" >= jp.years_of_experience
    AND (jp.salary_min IS NULL OR jr."expectedCtc" IS NULL OR jr."expectedCtc" >= jp.salary_min - 200000)
    AND (jp.salary_max IS NULL OR jr."expectedCtc" IS NULL OR jr."expectedCtc" <= jp.salary_max + 200000)
  ORDER BY COALESCE(ss.avg_score, 0.00) DESC,
           COALESCE(ss.total_scores, 0) DESC,
           jr."yearsOfExperience" DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- Strength score triggers
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.init_strength_score_on_job_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'seeker' THEN
    INSERT INTO public.strength_scores (job_requirement_id, seeker_id, role)
    VALUES (NEW.id, NEW."userId", NEW.role)
    ON CONFLICT (job_requirement_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_strength_score_on_job_requirement ON public.job_requirements;
CREATE TRIGGER trg_init_strength_score_on_job_requirement
  AFTER INSERT ON public.job_requirements
  FOR EACH ROW EXECUTE FUNCTION public.init_strength_score_on_job_requirement();

CREATE OR REPLACE FUNCTION public.update_strength_scores_on_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.strength_scores ss
  SET avg_score = COALESCE(public.calculate_strength_score(NEW.seeker_id), 0.00),
      total_scores = (
        SELECT COUNT(DISTINCT s.referrer_id)
        FROM public.scores s
        WHERE s.seeker_id = NEW.seeker_id
      ),
      updated_at = NOW()
  WHERE ss.seeker_id = NEW.seeker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_strength_scores_on_score ON public.scores;
CREATE TRIGGER trg_update_strength_scores_on_score
  AFTER INSERT OR UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.update_strength_scores_on_score();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_parameters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_matches   ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- job_requirements
DROP POLICY IF EXISTS "jr_select_authenticated" ON public.job_requirements;
CREATE POLICY "jr_select_authenticated" ON public.job_requirements
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "jr_insert_owner" ON public.job_requirements;
CREATE POLICY "jr_insert_owner" ON public.job_requirements
  FOR INSERT WITH CHECK (auth.uid() = "userId");
DROP POLICY IF EXISTS "jr_update_owner" ON public.job_requirements;
CREATE POLICY "jr_update_owner" ON public.job_requirements
  FOR UPDATE USING (auth.uid() = "userId");
DROP POLICY IF EXISTS "jr_delete_owner" ON public.job_requirements;
CREATE POLICY "jr_delete_owner" ON public.job_requirements
  FOR DELETE USING (auth.uid() = "userId");

-- job_postings
DROP POLICY IF EXISTS "jp_select_authenticated" ON public.job_postings;
CREATE POLICY "jp_select_authenticated" ON public.job_postings
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "jp_insert_owner" ON public.job_postings;
CREATE POLICY "jp_insert_owner" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
DROP POLICY IF EXISTS "jp_update_owner" ON public.job_postings;
CREATE POLICY "jp_update_owner" ON public.job_postings
  FOR UPDATE USING (auth.uid() = recruiter_id);

-- referral_requests
DROP POLICY IF EXISTS "rr_select_participant" ON public.referral_requests;
CREATE POLICY "rr_select_participant" ON public.referral_requests
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = referrer_id);
DROP POLICY IF EXISTS "rr_insert_seeker" ON public.referral_requests;
CREATE POLICY "rr_insert_seeker" ON public.referral_requests
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);
DROP POLICY IF EXISTS "rr_update_participant" ON public.referral_requests;
CREATE POLICY "rr_update_participant" ON public.referral_requests
  FOR UPDATE USING (auth.uid() = seeker_id OR auth.uid() = referrer_id);

-- scores
DROP POLICY IF EXISTS "scores_select_participant" ON public.scores;
CREATE POLICY "scores_select_participant" ON public.scores
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = referrer_id);
DROP POLICY IF EXISTS "scores_insert_referrer" ON public.scores;
CREATE POLICY "scores_insert_referrer" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);
DROP POLICY IF EXISTS "scores_update_referrer" ON public.scores;
CREATE POLICY "scores_update_referrer" ON public.scores
  FOR UPDATE USING (auth.uid() = referrer_id);

-- scoring_parameters
DROP POLICY IF EXISTS "sp_select_anyone" ON public.scoring_parameters;
CREATE POLICY "sp_select_anyone" ON public.scoring_parameters
  FOR SELECT USING (TRUE);

-- strength_scores
DROP POLICY IF EXISTS "ss_select_authenticated" ON public.strength_scores;
CREATE POLICY "ss_select_authenticated" ON public.strength_scores
  FOR SELECT USING (auth.role() = 'authenticated');

-- candidate_matches
DROP POLICY IF EXISTS "cm_select_participant" ON public.candidate_matches;
CREATE POLICY "cm_select_participant" ON public.candidate_matches
  FOR SELECT USING (auth.uid() = recruiter_id OR auth.uid() = seeker_id);
DROP POLICY IF EXISTS "cm_insert_recruiter" ON public.candidate_matches;
CREATE POLICY "cm_insert_recruiter" ON public.candidate_matches
  FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
DROP POLICY IF EXISTS "cm_update_recruiter" ON public.candidate_matches;
CREATE POLICY "cm_update_recruiter" ON public.candidate_matches
  FOR UPDATE USING (auth.uid() = recruiter_id);

-- ---------------------------------------------------------------------
-- Storage: resumes bucket (public so PDFs can be opened in a tab)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "resumes_read" ON storage.objects;
CREATE POLICY "resumes_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "resumes_upload" ON storage.objects;
CREATE POLICY "resumes_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "resumes_update" ON storage.objects;
CREATE POLICY "resumes_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "resumes_delete" ON storage.objects;
CREATE POLICY "resumes_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Admin flag on profiles
-- Set is_admin = true in Supabase dashboard for team members who need
-- access to the admin test management panel.
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------
-- test_tiers
-- Each row represents one test tier (T1–T20 and beyond).
-- questions is a JSONB array of question objects matching the Question type.
-- Team members with is_admin=true can create, update, and delete tiers.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_tiers_number ON public.test_tiers(tier_number);
CREATE INDEX IF NOT EXISTS idx_test_tiers_active ON public.test_tiers(is_active);

-- RLS for test_tiers
ALTER TABLE public.test_tiers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active tiers
DROP POLICY IF EXISTS "tt_select_authenticated" ON public.test_tiers;
CREATE POLICY "tt_select_authenticated" ON public.test_tiers
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Admin users can read all tiers (including inactive)
DROP POLICY IF EXISTS "tt_select_admin" ON public.test_tiers;
CREATE POLICY "tt_select_admin" ON public.test_tiers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "tt_insert_admin" ON public.test_tiers;
CREATE POLICY "tt_insert_admin" ON public.test_tiers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "tt_update_admin" ON public.test_tiers;
CREATE POLICY "tt_update_admin" ON public.test_tiers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "tt_delete_admin" ON public.test_tiers;
CREATE POLICY "tt_delete_admin" ON public.test_tiers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ---------------------------------------------------------------------
-- test_completions
-- One row per (user, tier) — upserted on each attempt.
-- Server-side source of truth for scores, karma, and retake cooldowns.
-- Prevents localStorage manipulation from bypassing gates or faking karma.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier        INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 20),
  score       INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
  total       INTEGER NOT NULL DEFAULT 10,
  karma_change NUMERIC(6, 3) NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_tc_user ON public.test_completions(user_id);

ALTER TABLE public.test_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tc_select_own" ON public.test_completions;
CREATE POLICY "tc_select_own" ON public.test_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tc_insert_own" ON public.test_completions;
CREATE POLICY "tc_insert_own" ON public.test_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tc_update_own" ON public.test_completions;
CREATE POLICY "tc_update_own" ON public.test_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can read all completions (for analytics / leaderboard)
DROP POLICY IF EXISTS "tc_select_admin" ON public.test_completions;
CREATE POLICY "tc_select_admin" ON public.test_completions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ---------------------------------------------------------------------
-- get_leaderboard
-- Returns aggregated per-user stats for the global leaderboard.
-- SECURITY DEFINER so it can read all users' completions without
-- exposing raw rows — only aggregate totals are returned.
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_leaderboard(INTEGER);
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_n INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id      UUID,
  name         TEXT,
  organization TEXT,
  tests_passed BIGINT,
  total_karma  NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id                                                          AS user_id,
    COALESCE(p.name, split_part(p.email, '@', 1))                AS name,
    COALESCE(p.current_organization, '—')                        AS organization,
    COUNT(tc.id) FILTER (WHERE tc.score >= 6)                    AS tests_passed,
    COALESCE(SUM(tc.karma_change), 0)                            AS total_karma
  FROM public.profiles p
  INNER JOIN public.test_completions tc ON tc.user_id = p.id
  GROUP BY p.id, p.name, p.email, p.current_organization
  ORDER BY total_karma DESC, tests_passed DESC
  LIMIT limit_n;
$$;

-- Only authenticated users may call this function
REVOKE ALL ON FUNCTION public.get_leaderboard(INTEGER) FROM PUBLIC;

-- ---------------------------------------------------------------------
-- referrer_slots: calendar slots a referrer offers for interviews
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrer_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_start    TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER NOT NULL DEFAULT 30 CHECK (duration_mins IN (30, 45, 60)),
  is_booked     BOOLEAN NOT NULL DEFAULT false,
  booked_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referrer_id, slot_start)
);

CREATE INDEX IF NOT EXISTS idx_rs_referrer  ON public.referrer_slots(referrer_id);
CREATE INDEX IF NOT EXISTS idx_rs_available ON public.referrer_slots(is_booked, slot_start);

ALTER TABLE public.referrer_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rs_select" ON public.referrer_slots;
CREATE POLICY "rs_select" ON public.referrer_slots
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "rs_insert" ON public.referrer_slots;
CREATE POLICY "rs_insert" ON public.referrer_slots
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "rs_update" ON public.referrer_slots;
CREATE POLICY "rs_update" ON public.referrer_slots
  FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "rs_delete" ON public.referrer_slots;
CREATE POLICY "rs_delete" ON public.referrer_slots
  FOR DELETE USING (auth.uid() = referrer_id AND is_booked = false);

-- Add interview columns to referral_requests
ALTER TABLE public.referral_requests
  ADD COLUMN IF NOT EXISTS slot_id      UUID REFERENCES public.referrer_slots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS interview_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meet_link    TEXT;

-- Widen status to include 'scheduled'
ALTER TABLE public.referral_requests
  DROP CONSTRAINT IF EXISTS referral_requests_status_check;
ALTER TABLE public.referral_requests
  ADD CONSTRAINT referral_requests_status_check
  CHECK (status IN ('pending', 'scheduled', 'completed', 'scored'));
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO authenticated;
