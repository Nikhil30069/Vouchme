-- Fix Remote Database Issues
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Create scoring_parameters table first
CREATE TABLE IF NOT EXISTS public.scoring_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create referral_requests table
CREATE TABLE IF NOT EXISTS public.referral_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID REFERENCES public.profiles(id),
  referrer_id UUID REFERENCES public.profiles(id),
  job_role TEXT NOT NULL,
  seeker_experience_years INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_request_id UUID,
  referrer_id UUID REFERENCES public.profiles(id),
  seeker_id UUID REFERENCES public.profiles(id),
  parameter_id UUID REFERENCES public.scoring_parameters(id),
  score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 10),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create candidate_matches table
CREATE TABLE IF NOT EXISTS public.candidate_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID REFERENCES public.profiles(id),
  job_posting_id UUID REFERENCES public.job_postings(id),
  recruiter_id UUID REFERENCES public.profiles(id),
  is_interested BOOLEAN DEFAULT false,
  phone_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seeker_id, job_posting_id, recruiter_id)
);

-- 6. Insert default scoring parameters
INSERT INTO public.scoring_parameters (name, description, weight) VALUES
('Technical Abilities', 'Assessment of technical skills and knowledge', 0.6),
('Cultural Fit', 'Assessment of team compatibility and work style', 0.4)
ON CONFLICT DO NOTHING;

-- 7. Create calculate_strength_score function
CREATE OR REPLACE FUNCTION calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  avg_score DECIMAL(4,2);
BEGIN
  SELECT COALESCE(AVG(s.score), 0)
  INTO avg_score
  FROM public.scores s
  WHERE s.seeker_id = seeker_uuid;
  
  RETURN ROUND(avg_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create get_top_candidates function
DROP FUNCTION IF EXISTS public.get_top_candidates(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_top_candidates(job_posting_uuid UUID, limit_count INTEGER DEFAULT 3)
RETURNS TABLE(
  seeker_id UUID,
  seeker_name TEXT,
  seeker_role TEXT,
  seeker_experience INTEGER,
  strength_score DECIMAL(4,2),
  total_scores INTEGER,
  expected_ctc INTEGER,
  current_ctc INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as seeker_id,
    p.name as seeker_name,
    (p.work_experience->>'role')::TEXT as seeker_role,
    (p.work_experience->>'years_of_experience')::INTEGER as seeker_experience,
    COALESCE(calculate_strength_score(p.id), 0) as strength_score,
    COUNT(DISTINCT s.id)::INTEGER as total_scores,
    COALESCE((p.work_experience->>'expectedCTC')::INTEGER, 0) as expected_ctc,
    COALESCE((p.work_experience->>'currentCTC')::INTEGER, 0) as current_ctc
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    -- 1. Check if years of experience matches <= candidate's work experience
    AND COALESCE((p.work_experience->>'years_of_experience')::INTEGER, 0) >= jp.years_of_experience
    -- 2. Check if candidate's expected CTC falls between [minimum salary - 2 LPA, maximum salary + 2 LPA]
    AND COALESCE((p.work_experience->>'expectedCTC')::INTEGER, 0) >= (jp.salary_min - 200000)
    AND COALESCE((p.work_experience->>'expectedCTC')::INTEGER, 0) <= (jp.salary_max + 200000)
    -- 3. Only include candidates who have received scores
    AND EXISTS (
      SELECT 1 FROM public.scores s2 
      WHERE s2.seeker_id = p.id
    )
  GROUP BY p.id, p.name, p.work_experience, jp.salary_min, jp.salary_max
  ORDER BY COALESCE(calculate_strength_score(p.id), 0) DESC, COUNT(DISTINCT s.id) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Disable RLS for development
ALTER TABLE public.job_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests DISABLE ROW LEVEL SECURITY; 