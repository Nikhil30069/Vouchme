-- Update referral system to be job-requirement specific
-- This migration updates the referral_requests table to link to job requirements

-- Add job_requirement_id to referral_requests table
ALTER TABLE public.referral_requests 
ADD COLUMN job_requirement_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the unique constraint to include job_requirement_id
DROP INDEX IF EXISTS idx_referral_requests_seeker_referrer_role;
ALTER TABLE public.referral_requests 
DROP CONSTRAINT IF EXISTS referral_requests_seeker_id_referrer_id_job_role_key;

ALTER TABLE public.referral_requests 
ADD CONSTRAINT referral_requests_seeker_id_referrer_id_job_requirement_id_key 
UNIQUE(seeker_id, referrer_id, job_requirement_id);

-- Create index for job requirement lookups
CREATE INDEX idx_referral_requests_job_requirement ON public.referral_requests(job_requirement_id);

-- Update the find_eligible_referrers function to work with job requirements
CREATE OR REPLACE FUNCTION find_eligible_referrers_for_job(job_requirement_uuid UUID)
RETURNS TABLE(
  referrer_id UUID,
  referrer_name TEXT,
  referrer_role TEXT,
  referrer_experience INTEGER,
  organization TEXT,
  job_role TEXT,
  job_experience INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as referrer_id,
    p.name as referrer_name,
    (p.work_experience->>'role')::TEXT as referrer_role,
    (p.work_experience->>'years')::INTEGER as referrer_experience,
    (p.work_experience->>'organization')::TEXT as organization,
    (pr.work_experience->>'role')::TEXT as job_role,
    (pr.work_experience->>'years')::INTEGER as job_experience
  FROM public.profiles p
  CROSS JOIN public.profiles pr
  WHERE p.persona = 'referrer'
    AND pr.id = job_requirement_uuid
    AND (p.work_experience->>'role')::TEXT = (pr.work_experience->>'role')::TEXT
    AND (p.work_experience->>'years')::INTEGER > ((pr.work_experience->>'years')::INTEGER + 1)
    AND p.id NOT IN (
      SELECT referrer_id 
      FROM public.referral_requests 
      WHERE job_requirement_id = job_requirement_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 