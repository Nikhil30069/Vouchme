-- Update the get_top_candidates function to implement the correct logic
-- 1. Check if years of experience matches <= candidate's work experience
-- 2. Check if candidate's expected CTC falls between [minimum salary - 2 LPA, maximum salary + 2 LPA]
-- 3. After these filters, pull top 3 profiles based on strength score

-- Drop the existing function first to allow return type changes
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
    (p.work_experience->>'role')::TEXT as seeker_role,
    (p.work_experience->>'years_of_experience')::INTEGER as seeker_experience,
    calculate_strength_score(p.id) as strength_score,
    COUNT(DISTINCT s.id) as total_scores,
    (p.work_experience->>'expectedCTC')::INTEGER as expected_ctc,
    (p.work_experience->>'currentCTC')::INTEGER as current_ctc
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
    -- 1. Check if years of experience matches <= candidate's work experience
    AND (p.work_experience->>'years_of_experience')::INTEGER >= jp.years_of_experience
    -- 2. Check if candidate's expected CTC falls between [minimum salary - 2 LPA, maximum salary + 2 LPA]
    AND (p.work_experience->>'expectedCTC')::INTEGER >= (jp.salary_min - 200000) -- 2 LPA = 200,000
    AND (p.work_experience->>'expectedCTC')::INTEGER <= (jp.salary_max + 200000) -- 2 LPA = 200,000
    -- 3. Only include candidates who have received scores
    AND EXISTS (
      SELECT 1 FROM public.scores s2 
      WHERE s2.seeker_id = p.id
    )
  GROUP BY p.id, p.name, p.work_experience, jp.salary_min, jp.salary_max
  ORDER BY calculate_strength_score(p.id) DESC, total_scores DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 