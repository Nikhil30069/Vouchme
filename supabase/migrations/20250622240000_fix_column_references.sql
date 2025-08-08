-- Fix column references in functions to match actual database schema
-- Use job_requirements for role/experience to avoid depending on profile columns

-- Fix get_top_candidates function
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
    p.id AS seeker_id,
    p.name AS seeker_name,
    COALESCE(jr.role, jp.role) AS seeker_role,
    COALESCE(jr."yearsOfExperience", 0) AS seeker_experience,
    calculate_strength_score(p.id) AS strength_score,
    COUNT(DISTINCT s.id)::INTEGER AS total_scores,
    NULL::INTEGER AS expected_ctc,
    NULL::INTEGER AS current_ctc
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  LEFT JOIN public.job_requirements jr
    ON jr."userId" = p.id
    AND jr.role = jp.role
    AND jr.type = 'seeker'
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    -- Experience filter from seeker job requirement
    AND jr."yearsOfExperience" >= jp.years_of_experience
    -- Only include candidates who have received scores
    AND EXISTS (
      SELECT 1 FROM public.scores s2 
      WHERE s2.seeker_id = p.id
    )
  GROUP BY p.id, p.name, jr.role, jp.role, jr."yearsOfExperience"
  ORDER BY calculate_strength_score(p.id) DESC, total_scores DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix find_eligible_referrers_for_job function (leave as-is if profiles has columns)
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
    COALESCE(jr.role, jp.role) as referrer_role,
    COALESCE(jr."yearsOfExperience", 0) as referrer_experience,
    NULL::TEXT as organization,
    NULL::INTEGER as total_experience_years,
    NULL::TEXT[] as organizations,
    NULL::TEXT as current_organization
  FROM public.profiles p
  CROSS JOIN public.job_postings jp
  LEFT JOIN public.job_requirements jr
    ON jr."userId" = p.id
    AND jr.role = jp.role
    AND jr.type = 'referrer'
  WHERE p.persona = 'referrer'
    AND jp.id = job_requirement_id
    AND COALESCE(jr.role, jp.role) = jp.role
    AND COALESCE(jr."yearsOfExperience", 0) > (jp.years_of_experience + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
