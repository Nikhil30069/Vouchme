-- Update get_top_candidates to include candidates with zero scores
-- and filter salary based on seeker job_requirements expectedCtc

DROP FUNCTION IF EXISTS public.get_top_candidates(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.get_top_candidates(job_posting_uuid UUID, limit_count INTEGER DEFAULT 3)
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
    COUNT(s.id)::INTEGER AS total_scores,
    jr."expectedCtc"::INTEGER AS expected_ctc,
    jr."currentCtc"::INTEGER AS current_ctc
  FROM public.profiles p
  CROSS JOIN public.job_postings jp
  LEFT JOIN public.job_requirements jr
    ON jr."userId" = p.id
    AND jr.role = jp.role
    AND jr.type = 'seeker'
  LEFT JOIN public.scores s ON s.seeker_id = p.id
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    AND jr."yearsOfExperience" >= jp.years_of_experience
    AND jr."expectedCtc" BETWEEN (jp.salary_min - 200000) AND (jp.salary_max + 200000)
  GROUP BY p.id, p.name, jr.role, jp.role, jr."yearsOfExperience", jr."expectedCtc", jr."currentCtc"
  ORDER BY calculate_strength_score(p.id) DESC, total_scores DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
