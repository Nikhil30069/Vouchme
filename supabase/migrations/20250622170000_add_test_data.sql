-- Add test data for top candidates functionality

-- Insert test seekers with different experience levels and expected CTCs
INSERT INTO auth.users (
  id,
  email,
  phone,
  created_at,
  updated_at
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'test.seeker1@example.com', '+91 98765 43220', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'test.seeker2@example.com', '+91 98765 43221', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'test.seeker3@example.com', '+91 98765 43222', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update the auto-created profiles with seeker data
UPDATE public.profiles SET
  name = 'Arjun Kumar',
  email = 'test.seeker1@example.com',
  persona = 'seeker',
  work_experience = '{"role": "Software Engineer", "years_of_experience": 3, "organization": "TCS", "expectedCTC": 800000, "currentCTC": 600000}',
  updated_at = NOW()
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE public.profiles SET
  name = 'Priya Singh',
  email = 'test.seeker2@example.com',
  persona = 'seeker',
  work_experience = '{"role": "Software Engineer", "years_of_experience": 5, "organization": "Infosys", "expectedCTC": 1200000, "currentCTC": 900000}',
  updated_at = NOW()
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE public.profiles SET
  name = 'Rahul Sharma',
  email = 'test.seeker3@example.com',
  persona = 'seeker',
  work_experience = '{"role": "Software Engineer", "years_of_experience": 7, "organization": "Wipro", "expectedCTC": 1800000, "currentCTC": 1400000}',
  updated_at = NOW()
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Insert test referrer for scoring
INSERT INTO auth.users (
  id,
  email,
  phone,
  created_at,
  updated_at
) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'test.referrer@example.com', '+91 98765 43223', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
  name = 'Senior Dev',
  email = 'test.referrer@example.com',
  persona = 'referrer',
  work_experience = '{"role": "Software Engineer", "years_of_experience": 10, "organization": "Google"}',
  updated_at = NOW()
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- Create referral requests for the seekers
INSERT INTO public.referral_requests (
  id,
  seeker_id,
  referrer_id,
  job_role,
  seeker_experience_years,
  status,
  created_at,
  updated_at
) VALUES
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Software Engineer', 3, 'scored', NOW(), NOW()),
(gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Software Engineer', 5, 'scored', NOW(), NOW()),
(gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Software Engineer', 7, 'scored', NOW(), NOW());

-- Add scores for the seekers (using the default scoring parameters)
INSERT INTO public.scores (
  referral_request_id,
  referrer_id,
  seeker_id,
  parameter_id,
  score,
  comments,
  created_at,
  updated_at
) SELECT 
  rr.id,
  rr.referrer_id,
  rr.seeker_id,
  sp.id,
  CASE 
    WHEN rr.seeker_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 7.5  -- Good candidate
    WHEN rr.seeker_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 8.5  -- Excellent candidate
    WHEN rr.seeker_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' THEN 9.0  -- Elite candidate
  END,
  'Test score',
  NOW(),
  NOW()
FROM public.referral_requests rr
CROSS JOIN public.scoring_parameters sp
WHERE rr.seeker_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
  AND sp.is_active = true;

-- Add test recruiter first
INSERT INTO auth.users (
  id,
  email,
  phone,
  created_at,
  updated_at
) VALUES
('66666666-6666-6666-6666-666666666666', 'test.recruiter@example.com', '+91 98765 43224', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
  name = 'Test Recruiter',
  email = 'test.recruiter@example.com',
  persona = 'recruiter',
  work_experience = '{"role": "HR Manager", "years_of_experience": 5, "organization": "TechCorp"}',
  updated_at = NOW()
WHERE id = '66666666-6666-6666-6666-666666666666';

-- Add a test job posting from the recruiter
INSERT INTO public.job_postings (
  id,
  recruiter_id,
  title,
  role,
  years_of_experience,
  salary_min,
  salary_max,
  description,
  requirements,
  is_active,
  created_at,
  updated_at
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '66666666-6666-6666-6666-666666666666',
  'Software Engineer - Backend',
  'Software Engineer',
  2, -- Minimum 2 years experience
  600000, -- 6 LPA minimum
  1500000, -- 15 LPA maximum
  'We are looking for a talented Software Engineer to join our backend team.',
  ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'AWS'],
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING; 