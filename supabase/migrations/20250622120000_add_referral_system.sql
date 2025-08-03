-- Migration for Referral System
-- This migration adds tables for the comprehensive referral and scoring system

-- 1. Scoring Parameters Table (DB configurable)
CREATE TABLE public.scoring_parameters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_score INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Referral Requests Table
CREATE TABLE public.referral_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  seeker_experience_years INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'scored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seeker_id, referrer_id, job_role)
);

-- 3. Scores Table
CREATE TABLE public.scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referral_request_id UUID NOT NULL REFERENCES public.referral_requests(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES public.scoring_parameters(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referral_request_id, parameter_id)
);

-- 4. Job Postings Table
CREATE TABLE public.job_postings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Candidate Matches Table (for tracking recruiter interest)
CREATE TABLE public.candidate_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strength_score DECIMAL(4,2),
  is_interested BOOLEAN NOT NULL DEFAULT false,
  phone_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_posting_id, seeker_id)
);

-- Insert default scoring parameters
INSERT INTO public.scoring_parameters (name, description, max_score, weight) VALUES
('Technical Abilities', 'Technical skills and problem-solving capabilities', 10, 1.00),
('Cultural Fit', 'Ownership, Energy, and Communication combined', 10, 1.00);

-- Enable RLS on all new tables
ALTER TABLE public.scoring_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scoring_parameters (read-only for all authenticated users)
CREATE POLICY "Anyone can view scoring parameters" ON public.scoring_parameters
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify scoring parameters" ON public.scoring_parameters
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE persona = 'admin'
  ));

-- RLS Policies for referral_requests
CREATE POLICY "Users can view their own referral requests" ON public.referral_requests
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = referrer_id);

CREATE POLICY "Seekers can create referral requests" ON public.referral_requests
  FOR INSERT WITH CHECK (
    auth.uid() = seeker_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND persona = 'seeker')
  );

CREATE POLICY "Referrers can update referral requests" ON public.referral_requests
  FOR UPDATE USING (
    auth.uid() = referrer_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND persona = 'referrer')
  );

-- RLS Policies for scores
CREATE POLICY "Users can view scores for their requests" ON public.scores
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = referrer_id);

CREATE POLICY "Referrers can create scores" ON public.scores
  FOR INSERT WITH CHECK (
    auth.uid() = referrer_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND persona = 'referrer')
  );

CREATE POLICY "Referrers can update their own scores" ON public.scores
  FOR UPDATE USING (auth.uid() = referrer_id);

-- RLS Policies for job_postings
CREATE POLICY "Anyone can view active job postings" ON public.job_postings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Recruiters can view their own job postings" ON public.job_postings
  FOR SELECT USING (
    auth.uid() = recruiter_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND persona = 'recruiter')
  );

CREATE POLICY "Recruiters can create job postings" ON public.job_postings
  FOR INSERT WITH CHECK (
    auth.uid() = recruiter_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND persona = 'recruiter')
  );

CREATE POLICY "Recruiters can update their own job postings" ON public.job_postings
  FOR UPDATE USING (auth.uid() = recruiter_id);

-- RLS Policies for candidate_matches
CREATE POLICY "Recruiters can view matches for their job postings" ON public.candidate_matches
  FOR SELECT USING (auth.uid() = recruiter_id);

CREATE POLICY "Seekers can view their own matches" ON public.candidate_matches
  FOR SELECT USING (auth.uid() = seeker_id);

CREATE POLICY "System can create candidate matches" ON public.candidate_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Recruiters can update matches for their job postings" ON public.candidate_matches
  FOR UPDATE USING (auth.uid() = recruiter_id);

-- Create indexes for better performance
CREATE INDEX idx_referral_requests_seeker ON public.referral_requests(seeker_id);
CREATE INDEX idx_referral_requests_referrer ON public.referral_requests(referrer_id);
CREATE INDEX idx_referral_requests_status ON public.referral_requests(status);
CREATE INDEX idx_scores_referral_request ON public.scores(referral_request_id);
CREATE INDEX idx_scores_seeker ON public.scores(seeker_id);
CREATE INDEX idx_job_postings_recruiter ON public.job_postings(recruiter_id);
CREATE INDEX idx_job_postings_role ON public.job_postings(role);
CREATE INDEX idx_candidate_matches_job ON public.candidate_matches(job_posting_id);
CREATE INDEX idx_candidate_matches_seeker ON public.candidate_matches(seeker_id);

-- Create function to calculate strength score
CREATE OR REPLACE FUNCTION calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  avg_score DECIMAL(4,2);
BEGIN
  SELECT COALESCE(AVG(s.score * sp.weight), 0)
  INTO avg_score
  FROM public.scores s
  JOIN public.scoring_parameters sp ON s.parameter_id = sp.id
  WHERE s.seeker_id = seeker_uuid AND sp.is_active = true;
  
  RETURN ROUND(avg_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to find eligible referrers
CREATE OR REPLACE FUNCTION find_eligible_referrers(seeker_role TEXT, seeker_experience INTEGER)
RETURNS TABLE(
  referrer_id UUID,
  referrer_name TEXT,
  referrer_role TEXT,
  referrer_experience INTEGER,
  organization TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as referrer_id,
    p.name as referrer_name,
    (p.work_experience->>'role')::TEXT as referrer_role,
    (p.work_experience->>'years')::INTEGER as referrer_experience,
    (p.work_experience->>'organization')::TEXT as organization
  FROM public.profiles p
  WHERE p.persona = 'referrer'
    AND (p.work_experience->>'role')::TEXT = seeker_role
    AND (p.work_experience->>'years')::INTEGER > (seeker_experience + 1)
    AND p.id NOT IN (
      SELECT referrer_id 
      FROM public.referral_requests 
      WHERE seeker_id = auth.uid() 
        AND job_role = seeker_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get top candidates for a job
CREATE OR REPLACE FUNCTION get_top_candidates(job_posting_uuid UUID, limit_count INTEGER DEFAULT 3)
RETURNS TABLE(
  seeker_id UUID,
  seeker_name TEXT,
  seeker_role TEXT,
  seeker_experience INTEGER,
  strength_score DECIMAL(4,2),
  total_scores INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as seeker_id,
    p.name as seeker_name,
    (p.work_experience->>'role')::TEXT as seeker_role,
    (p.work_experience->>'years')::INTEGER as seeker_experience,
    calculate_strength_score(p.id) as strength_score,
    COUNT(DISTINCT s.id) as total_scores
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  WHERE p.persona = 'seeker'
    AND (p.work_experience->>'role')::TEXT = (
      SELECT role FROM public.job_postings WHERE id = job_posting_uuid
    )
    AND (p.work_experience->>'years')::INTEGER >= (
      SELECT years_of_experience FROM public.job_postings WHERE id = job_posting_uuid
    )
  GROUP BY p.id, p.name, p.work_experience
  HAVING COUNT(DISTINCT s.id) > 0
  ORDER BY calculate_strength_score(p.id) DESC, total_scores DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 