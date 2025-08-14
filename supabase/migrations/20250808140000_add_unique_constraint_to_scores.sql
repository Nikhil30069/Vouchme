-- Add unique constraint to prevent multiple scores for the same referral request and parameter
-- This ensures one referrer can only submit one score per parameter per referral request

-- Add unique constraint on (referral_request_id, parameter_id)
ALTER TABLE public.scores 
ADD CONSTRAINT scores_unique_referral_parameter 
UNIQUE (referral_request_id, parameter_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT scores_unique_referral_parameter ON public.scores IS 'Prevents multiple scores for the same referral request and parameter combination';

-- Verify the constraint was added
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'scores' 
    AND tc.constraint_type = 'UNIQUE';
