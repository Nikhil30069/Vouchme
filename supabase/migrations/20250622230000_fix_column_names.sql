-- Fix column name references in all functions
-- The actual column name is 'workExperience' (camelCase), not 'work_experience' (snake_case)

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
    (p."workExperience"->>'role')::TEXT as seeker_role,
    (p."workExperience"->>'years_of_experience')::INTEGER as seeker_experience,
    calculate_strength_score(p.id) as strength_score,
    COUNT(DISTINCT s.id)::INTEGER as total_scores,
    (p."workExperience"->>'expectedCTC')::INTEGER as expected_ctc,
    (p."workExperience"->>'currentCTC')::INTEGER as current_ctc
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    -- 1. Check if years of experience matches <= candidate's work experience
    AND (p."workExperience"->>'years_of_experience')::INTEGER >= jp.years_of_experience
    -- 2. Check if candidate's expected CTC falls between [minimum salary - 2 LPA, maximum salary + 2 LPA]
    AND (p."workExperience"->>'expectedCTC')::INTEGER >= (jp.salary_min - 200000) -- 2 LPA = 200,000
    AND (p."workExperience"->>'expectedCTC')::INTEGER <= (jp.salary_max + 200000) -- 2 LPA = 200,000
    -- 3. Only include candidates who have received scores
    AND EXISTS (
      SELECT 1 FROM public.scores s2 
      WHERE s2.seeker_id = p.id
    )
  GROUP BY p.id, p.name, p."workExperience", jp.salary_min, jp.salary_max
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
    (p."workExperience"->>'role')::TEXT as referrer_role,
    (p."workExperience"->>'years')::INTEGER as referrer_experience,
    (p."workExperience"->>'organization')::TEXT as organization,
    p.total_experience_years,
    p.organizations,
    p.current_organization
  FROM public.profiles p
  CROSS JOIN public.job_postings pr
  WHERE p.persona = 'referrer'
    AND pr.id = job_requirement_id
    AND (p."workExperience"->>'role')::TEXT = (pr.work_experience->>'role')::TEXT
    AND (p."workExperience"->>'years')::INTEGER > ((pr.work_experience->>'years')::INTEGER + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix calculate_strength_score function
DROP FUNCTION IF EXISTS public.calculate_strength_score(UUID);

CREATE OR REPLACE FUNCTION calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  avg_score DECIMAL(4,2);
BEGIN
  SELECT AVG(score) INTO avg_score
  FROM public.scores
  WHERE seeker_id = seeker_uuid;
  
  RETURN COALESCE(avg_score, 0.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
