-- Add experience and organization fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN total_experience_years INTEGER,
ADD COLUMN organizations TEXT[],
ADD COLUMN current_organization TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.total_experience_years IS 'Total years of professional experience';
COMMENT ON COLUMN public.profiles.organizations IS 'Array of organizations where the user has worked';
COMMENT ON COLUMN public.profiles.current_organization IS 'Current organization where the user works';

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.find_eligible_referrers_for_job(UUID);

-- Create the updated function with new fields
CREATE FUNCTION public.find_eligible_referrers_for_job(job_requirement_uuid UUID)
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
    p.id as referrer_id,
    p.full_name as referrer_name,
    p.role as referrer_role,
    p.years_of_experience as referrer_experience,
    p.organization,
    p.total_experience_years,
    p.organizations,
    p.current_organization
  FROM public.profiles p
  INNER JOIN public.profiles job_req ON job_req.id = job_requirement_uuid
  WHERE p.id != job_requirement_uuid
    AND p.role = job_req.role
    AND p.years_of_experience > (job_req.years_of_experience + 1)
    AND p.user_type = 'referrer'
    AND NOT EXISTS (
      SELECT 1 FROM public.referral_requests rr
      WHERE rr.seeker_id = job_req.user_id
        AND rr.referrer_id = p.id
        AND rr.job_requirement_id = job_requirement_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 