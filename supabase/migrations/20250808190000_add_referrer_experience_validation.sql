-- Add database-level validation for referrer experience requirement
-- Ensure referrers cannot be created with less than 2 years of experience

-- The column is already named "workExperience" in the database
-- No need to rename, just add the constraint

-- Now add a check constraint that validates workExperience for referrers
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_referrer_experience_check 
CHECK (
  (persona != 'referrer') OR 
  (persona = 'referrer' AND 
   "workExperience" IS NOT NULL AND 
   ("workExperience"->>'years')::INTEGER >= 2)
);

-- Add comment for documentation
COMMENT ON CONSTRAINT profiles_referrer_experience_check ON public.profiles IS 
'Ensures referrers have at least 2 years of work experience.
This prevents freshers from joining the referrer pool, maintaining quality.';

-- Test the constraint (this should fail for referrers with < 2 years)
-- INSERT INTO public.profiles (name, phone, email, persona, "workExperience")
-- VALUES ('Test Referrer', '+1234567890', 'test@example.com', 'referrer', 
--         '{"role": "software-developer", "years": 1, "organization": "Test Corp"}');

-- This should work (2+ years experience)
-- INSERT INTO public.profiles (name, phone, email, persona, "workExperience")
-- VALUES ('Valid Referrer', '+1234567891', 'valid@example.com', 'referrer', 
--         '{"role": "software-developer", "years": 3, "organization": "Valid Corp"}');
