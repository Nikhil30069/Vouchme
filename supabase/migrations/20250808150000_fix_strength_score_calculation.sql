-- Implement cumulative rating system for strength scores
-- This creates a rating system that accumulates over time as more referrers score candidates
-- Formula: SUM(all weighted scores) / COUNT(unique referrers)

DROP FUNCTION IF EXISTS public.calculate_strength_score(UUID);

CREATE OR REPLACE FUNCTION calculate_strength_score(seeker_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  cumulative_score DECIMAL(4,2);
  total_weighted_score DECIMAL(10,2);
  unique_referrer_count INTEGER;
BEGIN
  -- Calculate total weighted score from all referrers
  SELECT COALESCE(SUM(s.score * sp.weight), 0.00)
  INTO total_weighted_score
  FROM public.scores s
  JOIN public.scoring_parameters sp ON s.parameter_id = sp.id
  WHERE s.seeker_id = seeker_uuid 
    AND sp.is_active = true;
  
  -- Count unique referrers who have scored this seeker
  SELECT COUNT(DISTINCT s.referrer_id)
  INTO unique_referrer_count
  FROM public.scores s
  WHERE s.seeker_id = seeker_uuid;
  
  -- Calculate cumulative rating: total weighted score / number of unique referrers
  IF unique_referrer_count > 0 THEN
    cumulative_score := total_weighted_score / unique_referrer_count;
  ELSE
    cumulative_score := 0.00;
  END IF;
  
  RETURN ROUND(cumulative_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.calculate_strength_score(UUID) IS 
'Calculates cumulative strength score based on weighted scores from multiple referrers.
Formula: SUM(score * weight) / COUNT(DISTINCT referrer_id)
This creates a rating system that improves as more referrers score the candidate.';

-- Create a helper function to get detailed scoring breakdown
CREATE OR REPLACE FUNCTION get_seeker_scoring_breakdown(seeker_uuid UUID)
RETURNS TABLE(
  referrer_count INTEGER,
  total_weighted_score DECIMAL(10,2),
  average_score_per_referrer DECIMAL(4,2),
  scoring_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH scoring_summary AS (
    SELECT 
      COUNT(DISTINCT s.referrer_id) as unique_referrers,
      SUM(s.score * sp.weight) as total_weighted,
      AVG(s.score * sp.weight) as avg_weighted_per_referrer,
      jsonb_agg(
        jsonb_build_object(
          'referrer_id', s.referrer_id,
          'parameter_name', sp.name,
          'score', s.score,
          'weight', sp.weight,
          'weighted_score', s.score * sp.weight
        )
      ) as details
    FROM public.scores s
    JOIN public.scoring_parameters sp ON s.parameter_id = sp.id
    WHERE s.seeker_id = seeker_uuid 
      AND sp.is_active = true
  )
  SELECT 
    unique_referrers,
    total_weighted,
    avg_weighted_per_referrer,
    details
  FROM scoring_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the new function (optional)
-- SELECT calculate_strength_score('your-seeker-uuid-here');
-- SELECT * FROM get_seeker_scoring_breakdown('your-seeker-uuid-here');
