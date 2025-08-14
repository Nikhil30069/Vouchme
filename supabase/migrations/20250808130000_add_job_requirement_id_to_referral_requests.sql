-- Add missing job_requirement_id column to referral_requests table
-- This column maps referral requests to their corresponding job requirements

-- Add the new column
ALTER TABLE public.referral_requests 
ADD COLUMN job_requirement_id uuid;

-- Add foreign key constraint to job_requirements table
ALTER TABLE public.referral_requests 
ADD CONSTRAINT referral_requests_job_requirement_id_fkey 
FOREIGN KEY (job_requirement_id) REFERENCES public.job_requirements(id) ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON COLUMN public.referral_requests.job_requirement_id IS 'Reference to the job requirement that this referral request is for';

-- Update existing records if any (optional - for data consistency)
-- UPDATE public.referral_requests 
-- SET job_requirement_id = (
--   SELECT jr.id 
--   FROM public.job_requirements jr 
--   WHERE jr."userId" = referral_requests.seeker_id 
--   AND jr.role = referral_requests.job_role
--   LIMIT 1
-- )
-- WHERE job_requirement_id IS NULL;

-- Make the column NOT NULL after ensuring all records have values
-- ALTER TABLE public.referral_requests ALTER COLUMN job_requirement_id SET NOT NULL;
