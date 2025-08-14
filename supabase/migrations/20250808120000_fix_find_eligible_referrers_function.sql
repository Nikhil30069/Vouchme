-- Fix find_eligible_referrers_for_job function to work with job_requirements
DROP FUNCTION IF EXISTS public.find_eligible_referrers_for_job(UUID);

CREATE OR REPLACE FUNCTION find_eligible_referrers_for_job(job_requirement_id UUID)
RETURNS TABLE(
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
    p.id as referrer_id,
    p.name as referrer_name,
    jr.role as referrer_role,
    jr."yearsOfExperience" as referrer_experience,
    p.organization,
    p.total_experience_years,
    p.organizations,
    p.current_organization
  FROM public.profiles p
  INNER JOIN public.job_requirements jr ON jr."userId" = p.id
  INNER JOIN public.job_requirements seeker_jr ON seeker_jr.id = job_requirement_id
  WHERE p.persona = 'referrer'
    AND jr.type = 'referrer'
    AND jr.role = seeker_jr.role
    AND jr."yearsOfExperience" > (seeker_jr."yearsOfExperience" + 1)
    AND NOT EXISTS (
      SELECT 1 FROM public.referral_requests rr
      WHERE rr.seeker_id = seeker_jr."userId"
        AND rr.referrer_id = p.id
        AND rr.job_requirement_id = job_requirement_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
