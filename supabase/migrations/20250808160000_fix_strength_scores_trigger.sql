-- Fix the strength_scores trigger function to properly use the new cumulative rating system
-- The current trigger is incorrectly counting total_scores and not properly updating avg_score

DROP TRIGGER IF EXISTS trg_update_strength_scores_on_score ON public.scores;

-- Drop the old function
DROP FUNCTION IF EXISTS public.update_strength_scores_on_score();

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.update_strength_scores_on_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ALL strength_scores rows for this seeker with the correct cumulative rating
  UPDATE public.strength_scores ss
  SET 
    avg_score = COALESCE(calculate_strength_score(NEW.seeker_id), 0.00),
    total_scores = (
      SELECT COUNT(DISTINCT s.referrer_id) 
      FROM public.scores s 
      WHERE s.seeker_id = NEW.seeker_id
    ),
    updated_at = NOW()
  WHERE ss.seeker_id = NEW.seeker_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER trg_update_strength_scores_on_score
AFTER INSERT OR UPDATE ON public.scores
FOR EACH ROW EXECUTE FUNCTION public.update_strength_scores_on_score();

-- Add comment for documentation
COMMENT ON FUNCTION public.update_strength_scores_on_score() IS 
'Updates strength_scores table when scores are inserted/updated.
Uses the new cumulative rating system: SUM(score * weight) / COUNT(DISTINCT referrer_id)
Updates total_scores to count unique referrers, not total score records.';

-- Test the fix by manually updating existing strength_scores
-- This will recalculate all existing strength scores with the new system
UPDATE public.strength_scores ss
SET 
  avg_score = COALESCE(calculate_strength_score(ss.seeker_id), 0.00),
  total_scores = (
    SELECT COUNT(DISTINCT s.referrer_id) 
    FROM public.scores s 
    WHERE s.seeker_id = ss.seeker_id
  ),
  updated_at = NOW();
