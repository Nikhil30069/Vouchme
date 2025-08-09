-- Strength scores snapshot table and triggers

CREATE TABLE IF NOT EXISTS public.strength_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_requirement_id INTEGER UNIQUE REFERENCES public.job_requirements(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL,
  role TEXT NOT NULL,
  avg_score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  total_scores INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: create a snapshot row at seeker job requirement creation
CREATE OR REPLACE FUNCTION public.init_strength_score_on_job_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'seeker' THEN
    INSERT INTO public.strength_scores (job_requirement_id, seeker_id, role)
    VALUES (NEW.id, NEW."userId", NEW.role)
    ON CONFLICT (job_requirement_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_strength_score_on_job_requirement ON public.job_requirements;
CREATE TRIGGER trg_init_strength_score_on_job_requirement
AFTER INSERT ON public.job_requirements
FOR EACH ROW EXECUTE FUNCTION public.init_strength_score_on_job_requirement();

-- Trigger: recompute snapshot when a new score is recorded
CREATE OR REPLACE FUNCTION public.update_strength_scores_on_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.strength_scores ss
  SET avg_score = COALESCE(calculate_strength_score(NEW.seeker_id), 0.00),
      total_scores = (SELECT COUNT(*) FROM public.scores s WHERE s.seeker_id = NEW.seeker_id),
      updated_at = NOW()
  WHERE ss.seeker_id = NEW.seeker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_strength_scores_on_score ON public.scores;
CREATE TRIGGER trg_update_strength_scores_on_score
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION public.update_strength_scores_on_score();
