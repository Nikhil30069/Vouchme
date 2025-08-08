-- Fix column references in functions to match actual database schema
-- The profiles table has direct columns: role, yearsOfExperience, not workExperience JSONB

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
    p.id as seeker_id,
    p.name as seeker_name,
    p.role as seeker_role,
    p."yearsOfExperience" as seeker_experience,
    calculate_strength_score(p.id) as strength_score,
    COUNT(DISTINCT s.id)::INTEGER as total_scores,
    p.expected_ctc as expected_ctc,
    p.current_ctc as current_ctc
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    -- 1. Check if years of experience matches <= candidate's work experience
    AND p."yearsOfExperience" >= jp.years_of_experience
    -- 2. Check if candidate's expected CTC falls between [minimum salary - 2 LPA, maximum salary + 2 LPA]
    AND p.expected_ctc >= (jp.salary_min - 200000) -- 2 LPA = 200,000
    AND p.expected_ctc <= (jp.salary_max + 200000) -- 2 LPA = 200,000
    -- 3. Only include candidates who have received scores
    AND EXISTS (
      SELECT 1 FROM public.scores s2 
      WHERE s2.seeker_id = p.id
    )
  GROUP BY p.id, p.name, p.role, p."yearsOfExperience", p.expected_ctc, p.current_ctc, jp.salary_min, jp.salary_max
  ORDER BY calculate_strength_score(p.id) DESC, total_scores DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix find_eligible_referrers_for_job function
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
    p.role as referrer_role,
    p."yearsOfExperience" as referrer_experience,
    p.organization as organization,
    p.total_experience_years,
    p.organizations,
    p.current_organization
  FROM public.profiles p
  CROSS JOIN public.job_postings pr
  WHERE p.persona = 'referrer'
    AND pr.id = job_requirement_id
    AND p.role = pr.role
    AND p."yearsOfExperience" > (pr.years_of_experience + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
