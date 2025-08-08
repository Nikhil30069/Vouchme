-- Add expected_ctc and current_ctc columns to profiles table
-- These are needed for the get_top_candidates function

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS expected_ctc INTEGER,
ADD COLUMN IF NOT EXISTS current_ctc INTEGER;
