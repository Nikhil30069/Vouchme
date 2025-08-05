-- Debug migration for get_top_candidates function
-- Let's create a simpler version first to debug the issue

-- Create a debug version that returns all seekers with scores
CREATE OR REPLACE FUNCTION debug_get_seekers_with_scores()
RETURNS TABLE(
  seeker_id UUID,
  seeker_name TEXT,
  seeker_persona TEXT,
  work_experience_json JSONB,
  score_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as seeker_id,
    p.name as seeker_name,
    p.persona as seeker_persona,
    p.work_experience as work_experience_json,
    COUNT(DISTINCT s.id)::INTEGER as score_count
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  WHERE p.persona = 'seeker'
  GROUP BY p.id, p.name, p.persona, p.work_experience;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a debug version that shows job postings
CREATE OR REPLACE FUNCTION debug_get_job_postings()
RETURNS TABLE(
  job_id UUID,
  job_title TEXT,
  job_role TEXT,
  min_experience INTEGER,
  salary_min INTEGER,
  salary_max INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jp.id as job_id,
    jp.title as job_title,
    jp.role as job_role,
    jp.years_of_experience as min_experience,
    jp.salary_min,
    jp.salary_max
  FROM public.job_postings jp
  WHERE jp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simplified version of get_top_candidates for debugging
CREATE OR REPLACE FUNCTION debug_get_top_candidates(job_posting_uuid UUID)
RETURNS TABLE(
  seeker_id UUID,
  seeker_name TEXT,
  seeker_role TEXT,
  seeker_experience INTEGER,
  expected_ctc INTEGER,
  current_ctc INTEGER,
  job_min_exp INTEGER,
  job_salary_min INTEGER,
  job_salary_max INTEGER,
  score_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as seeker_id,
    p.name as seeker_name,
    (p.work_experience->>'role')::TEXT as seeker_role,
    (p.work_experience->>'years_of_experience')::INTEGER as seeker_experience,
    (p.work_experience->>'expectedCTC')::INTEGER as expected_ctc,
    (p.work_experience->>'currentCTC')::INTEGER as current_ctc,
    jp.years_of_experience as job_min_exp,
    jp.salary_min as job_salary_min,
    jp.salary_max as job_salary_max,
    COUNT(DISTINCT s.id)::INTEGER as score_count
  FROM public.profiles p
  LEFT JOIN public.scores s ON p.id = s.seeker_id
  CROSS JOIN public.job_postings jp
  WHERE p.persona = 'seeker'
    AND jp.id = job_posting_uuid
  GROUP BY p.id, p.name, p.work_experience, jp.years_of_experience, jp.salary_min, jp.salary_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 