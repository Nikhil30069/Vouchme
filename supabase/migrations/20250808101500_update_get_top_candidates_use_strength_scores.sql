-- Update get_top_candidates to use strength_scores and case-insensitive role match

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
    jr.role AS seeker_role,
    jr."yearsOfExperience" AS seeker_experience,
    ss.avg_score AS strength_score,
    ss.total_scores AS total_scores,
    jr."expectedCtc"::INTEGER AS expected_ctc,
    jr."currentCtc"::INTEGER AS current_ctc
  FROM public.job_postings jp
  JOIN public.job_requirements jr
    ON jr.type = 'seeker'
  JOIN public.profiles p
    ON p.id = jr."userId" AND p.persona = 'seeker'
  LEFT JOIN public.strength_scores ss
    ON ss.job_requirement_id = jr.id
  WHERE jp.id = job_posting_uuid
    AND lower(jr.role) = lower(jp.role)
    AND jr."yearsOfExperience" >= jp.years_of_experience
    AND jr."expectedCtc" BETWEEN (jp.salary_min - 200000) AND (jp.salary_max + 200000)
  ORDER BY ss.avg_score DESC, ss.total_scores DESC, jr."yearsOfExperience" DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
