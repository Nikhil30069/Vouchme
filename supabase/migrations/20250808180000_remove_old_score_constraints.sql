-- Remove old conflicting score constraints and ensure new decimal type works properly
-- The old migration had INTEGER with CHECK (score >= 1 AND score <= 10)
-- We need to remove this and ensure our new DECIMAL(4,2) with CHECK (score >= 0 AND score <= 10) works

-- First, let's check what constraints exist on the scores table
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.scores'::regclass;

-- Remove the old constraint if it exists (the name might be auto-generated)
DO $$
BEGIN
  -- Try to find and drop the old constraint
  EXECUTE (
    'ALTER TABLE public.scores DROP CONSTRAINT IF EXISTS ' ||
    (SELECT conname FROM pg_constraint 
     WHERE conrelid = 'public.scores'::regclass 
     AND pg_get_constraintdef(oid) LIKE '%score >= 1 AND score <= 10%'
     LIMIT 1)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If no constraint found, that's fine
    NULL;
END $$;

-- Also ensure the score column is properly typed as DECIMAL(4,2)
-- This should already be done by the previous migration, but let's make sure
ALTER TABLE public.scores 
ALTER COLUMN score TYPE DECIMAL(4,2);

-- Ensure our new constraint is in place
ALTER TABLE public.scores 
DROP CONSTRAINT IF EXISTS scores_score_range_check;

ALTER TABLE public.scores 
ADD CONSTRAINT scores_score_range_check 
CHECK (score >= 0.00 AND score <= 10.00);

-- Verify the fix by checking if we can insert a score of 10.00
-- This should work now without the numeric overflow error
-- Test query (uncomment to test):
-- INSERT INTO public.scores (referral_request_id, referrer_id, seeker_id, parameter_id, score, comments)
-- VALUES ('test-uuid', 'test-uuid', 'test-uuid', 'test-uuid', 10.00, 'Test score 10')
-- ON CONFLICT DO NOTHING;

-- Clean up test data if it was inserted
-- DELETE FROM public.scores WHERE comments = 'Test score 10';
