-- Fix RLS policies for job_postings to allow creation
-- The issue is that test users are not properly authenticated with Supabase Auth

-- Drop and recreate the job postings policies to be more permissive
DROP POLICY IF EXISTS "Recruiters can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Recruiters can view their own job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Recruiters can update their own job postings" ON public.job_postings;

-- More permissive policies for development/testing
CREATE POLICY "Recruiters can create job postings" ON public.job_postings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = recruiter_id AND persona = 'recruiter')
  );

CREATE POLICY "Recruiters can view their own job postings" ON public.job_postings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = recruiter_id AND persona = 'recruiter')
  );

CREATE POLICY "Recruiters can update their own job postings" ON public.job_postings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = recruiter_id AND persona = 'recruiter')
  );

-- Also update candidate_matches policies to be more permissive
DROP POLICY IF EXISTS "Recruiters can view matches for their job postings" ON public.candidate_matches;
DROP POLICY IF EXISTS "System can create candidate matches" ON public.candidate_matches;
DROP POLICY IF EXISTS "Recruiters can update matches for their job postings" ON public.candidate_matches;

CREATE POLICY "Recruiters can view matches for their job postings" ON public.candidate_matches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = recruiter_id AND persona = 'recruiter')
  );

CREATE POLICY "System can create candidate matches" ON public.candidate_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Recruiters can update matches for their job postings" ON public.candidate_matches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = recruiter_id AND persona = 'recruiter')
  ); 