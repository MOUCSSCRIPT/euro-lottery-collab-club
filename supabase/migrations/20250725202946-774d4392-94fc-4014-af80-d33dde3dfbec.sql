-- Create table for storing official draw results
CREATE TABLE public.draw_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL UNIQUE,
  winning_numbers INTEGER[] NOT NULL,
  winning_stars INTEGER[] NOT NULL,
  jackpot_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing grid wins
CREATE TABLE public.grid_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grid_id UUID NOT NULL,
  draw_result_id UUID NOT NULL,
  matched_numbers INTEGER NOT NULL DEFAULT 0,
  matched_stars INTEGER NOT NULL DEFAULT 0,
  prize_rank INTEGER,
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (draw_result_id) REFERENCES public.draw_results(id) ON DELETE CASCADE
);

-- Enable RLS on new tables
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_wins ENABLE ROW LEVEL SECURITY;

-- RLS policies for draw_results (public read access)
CREATE POLICY "Anyone can view draw results" 
ON public.draw_results 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage draw results" 
ON public.draw_results 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS policies for grid_wins
CREATE POLICY "Users can view wins for their accessible grids" 
ON public.grid_wins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_grids gg
    JOIN public.groups g ON g.id = gg.group_id
    WHERE gg.id = grid_wins.grid_id
    AND (
      g.created_by = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "System can manage grid wins" 
ON public.grid_wins 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at on draw_results
CREATE TRIGGER update_draw_results_updated_at
  BEFORE UPDATE ON public.draw_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to check for wins and calculate prizes
CREATE OR REPLACE FUNCTION public.check_grid_wins(
  p_draw_result_id UUID,
  p_winning_numbers INTEGER[],
  p_winning_stars INTEGER[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  grid_record RECORD;
  matched_numbers INTEGER;
  matched_stars INTEGER;
  prize_rank INTEGER;
  prize_amount NUMERIC;
BEGIN
  -- Loop through all active grids
  FOR grid_record IN 
    SELECT gg.id, gg.numbers, gg.stars, gg.draw_date
    FROM public.group_grids gg
    WHERE gg.is_active = true
    AND gg.draw_date = (SELECT draw_date FROM public.draw_results WHERE id = p_draw_result_id)
  LOOP
    -- Count matched numbers and stars
    SELECT 
      COALESCE(array_length(array(SELECT unnest(grid_record.numbers) INTERSECT SELECT unnest(p_winning_numbers)), 1), 0),
      COALESCE(array_length(array(SELECT unnest(grid_record.stars) INTERSECT SELECT unnest(p_winning_stars)), 1), 0)
    INTO matched_numbers, matched_stars;
    
    -- Determine prize rank based on EuroMillions rules
    prize_rank := NULL;
    prize_amount := 0;
    
    IF matched_numbers = 5 AND matched_stars = 2 THEN
      prize_rank := 1; -- Jackpot
    ELSIF matched_numbers = 5 AND matched_stars = 1 THEN
      prize_rank := 2;
    ELSIF matched_numbers = 5 AND matched_stars = 0 THEN
      prize_rank := 3;
    ELSIF matched_numbers = 4 AND matched_stars = 2 THEN
      prize_rank := 4;
    ELSIF matched_numbers = 4 AND matched_stars = 1 THEN
      prize_rank := 5;
    ELSIF matched_numbers = 4 AND matched_stars = 0 THEN
      prize_rank := 6;
    ELSIF matched_numbers = 3 AND matched_stars = 2 THEN
      prize_rank := 7;
    ELSIF matched_numbers = 2 AND matched_stars = 2 THEN
      prize_rank := 8;
    ELSIF matched_numbers = 3 AND matched_stars = 1 THEN
      prize_rank := 9;
    ELSIF matched_numbers = 3 AND matched_stars = 0 THEN
      prize_rank := 10;
    ELSIF matched_numbers = 1 AND matched_stars = 2 THEN
      prize_rank := 11;
    ELSIF matched_numbers = 2 AND matched_stars = 1 THEN
      prize_rank := 12;
    ELSIF matched_numbers = 2 AND matched_stars = 0 THEN
      prize_rank := 13;
    END IF;
    
    -- Only insert if there's a win (prize_rank is not NULL)
    IF prize_rank IS NOT NULL THEN
      -- Set approximate prize amounts (these would be updated with real data)
      CASE prize_rank
        WHEN 1 THEN prize_amount := 50000000; -- Jackpot varies
        WHEN 2 THEN prize_amount := 500000;
        WHEN 3 THEN prize_amount := 50000;
        WHEN 4 THEN prize_amount := 2500;
        WHEN 5 THEN prize_amount := 150;
        WHEN 6 THEN prize_amount := 50;
        WHEN 7 THEN prize_amount := 25;
        WHEN 8 THEN prize_amount := 15;
        WHEN 9 THEN prize_amount := 12;
        WHEN 10 THEN prize_amount := 10;
        WHEN 11 THEN prize_amount := 8;
        WHEN 12 THEN prize_amount := 6;
        WHEN 13 THEN prize_amount := 4;
        ELSE prize_amount := 0;
      END CASE;
      
      INSERT INTO public.grid_wins (
        grid_id,
        draw_result_id,
        matched_numbers,
        matched_stars,
        prize_rank,
        prize_amount
      ) VALUES (
        grid_record.id,
        p_draw_result_id,
        matched_numbers,
        matched_stars,
        prize_rank,
        prize_amount
      )
      ON CONFLICT DO NOTHING; -- Prevent duplicates
    END IF;
  END LOOP;
END;
$$;