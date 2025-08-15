-- Fix score field precision to allow scores from 0-10
-- Current DECIMAL(3,2) only allows 0.00 to 9.99, but we need 0.00 to 10.00

-- First, let's check the current table structure
-- SELECT column_name, data_type, numeric_precision, numeric_scale 
-- FROM information_schema.columns 
-- WHERE table_name = 'scores' AND column_name = 'score';

-- Update the score column to DECIMAL(4,2) to allow 0.00 to 99.99 (more than enough for 0-10)
ALTER TABLE public.scores 
ALTER COLUMN score TYPE DECIMAL(4,2);

-- Add a check constraint to ensure scores are within valid range (0-10)
ALTER TABLE public.scores 
DROP CONSTRAINT IF EXISTS scores_score_range_check;

ALTER TABLE public.scores 
ADD CONSTRAINT scores_score_range_check 
CHECK (score >= 0.00 AND score <= 10.00);

-- Also fix the strength_scores table if it has similar precision issues
-- Check if avg_score needs updating too
ALTER TABLE public.strength_scores 
ALTER COLUMN avg_score TYPE DECIMAL(4,2);

-- Add comment for documentation
COMMENT ON COLUMN public.scores.score IS 
'Score value from 0.00 to 10.00 with 2 decimal places precision.
Updated from DECIMAL(3,2) to DECIMAL(4,2) to support full 0-10 range.';

-- Test the fix by trying to insert a score of 10.00 (this should work now)
-- INSERT INTO public.scores (referral_request_id, referrer_id, seeker_id, parameter_id, score, comments)
-- VALUES ('test-uuid', 'test-uuid', 'test-uuid', 'test-uuid', 10.00, 'Test score 10');
