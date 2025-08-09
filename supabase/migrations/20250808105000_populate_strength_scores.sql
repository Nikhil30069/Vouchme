-- Populate strength_scores table for existing seeker job requirements

-- Insert entries for all existing seeker job requirements
INSERT INTO public.strength_scores (job_requirement_id, seeker_id, role, avg_score, total_scores)
SELECT 
  jr.id,
  jr."userId",
  jr.role,
  COALESCE(
    (SELECT AVG(score) FROM public.scores WHERE seeker_id = jr."userId"),
    0.00
  ),
  COALESCE(
    (SELECT COUNT(*) FROM public.scores WHERE seeker_id = jr."userId"),
    0
  )
FROM public.job_requirements jr
WHERE jr.type = 'seeker'
  AND NOT EXISTS (
    SELECT 1 FROM public.strength_scores ss 
    WHERE ss.job_requirement_id = jr.id
  );
