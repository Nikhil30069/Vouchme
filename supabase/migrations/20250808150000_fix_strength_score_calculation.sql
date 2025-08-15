-- Fix calculate_strength_score function to properly consider parameter weights
-- This ensures scores are weighted by their importance (e.g., Technical: 0.60, Cultural: 0.40)

DROP FUNCTION IF EXISTS public.calculate_strength_score(UUID);

CREATE OR REPLACE FUNCTION calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  weighted_avg_score DECIMAL(4,2);
BEGIN
  -- Calculate weighted average: SUM(score * weight) / SUM(weight)
  SELECT COALESCE(
    SUM(s.score * sp.weight) / SUM(sp.weight), 
    0.00
  ) INTO weighted_avg_score
  FROM public.scores s
  JOIN public.scoring_parameters sp ON s.parameter_id = sp.id
  WHERE s.seeker_id = seeker_uuid 
    AND sp.is_active = true;
  
  RETURN ROUND(weighted_avg_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.calculate_strength_score(UUID) IS 
'Calculates weighted strength score for a seeker based on parameter weights. 
Formula: SUM(score * weight) / SUM(weight)';

-- Test the function with sample data (optional)
-- SELECT calculate_strength_score('your-seeker-uuid-here');
