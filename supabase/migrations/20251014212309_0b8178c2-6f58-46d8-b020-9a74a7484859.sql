-- Add status column to user_loto_foot_grids
ALTER TABLE public.user_loto_foot_grids 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS correct_predictions integer DEFAULT NULL;

-- Add check constraint for valid status values
ALTER TABLE public.user_loto_foot_grids 
ADD CONSTRAINT valid_user_grid_status 
CHECK (status IN ('pending', 'finished', 'won', 'lost'));

-- Add status column to loto_foot_grids
ALTER TABLE public.loto_foot_grids 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS correct_predictions integer DEFAULT NULL;

-- Add check constraint for valid status values
ALTER TABLE public.loto_foot_grids 
ADD CONSTRAINT valid_group_grid_status 
CHECK (status IN ('pending', 'finished', 'won', 'lost'));

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_user_loto_foot_grids_status ON public.user_loto_foot_grids(status);
CREATE INDEX IF NOT EXISTS idx_loto_foot_grids_status ON public.loto_foot_grids(status);
CREATE INDEX IF NOT EXISTS idx_user_loto_foot_grids_draw_date ON public.user_loto_foot_grids(draw_date);
CREATE INDEX IF NOT EXISTS idx_loto_foot_grids_draw_date ON public.loto_foot_grids(draw_date);

-- Create function to calculate grid results
CREATE OR REPLACE FUNCTION public.calculate_loto_foot_results(
  p_draw_date date,
  p_winning_results jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grid RECORD;
  v_correct_count integer;
  v_match_id text;
  v_user_prediction text;
  v_winning_result text;
BEGIN
  -- Process user grids
  FOR v_grid IN 
    SELECT id, predictions, user_id
    FROM public.user_loto_foot_grids
    WHERE draw_date = p_draw_date AND status = 'pending'
  LOOP
    v_correct_count := 0;
    
    -- Compare each prediction
    FOR v_match_id IN SELECT jsonb_object_keys(v_grid.predictions)
    LOOP
      v_user_prediction := v_grid.predictions->>v_match_id;
      v_winning_result := p_winning_results->>v_match_id;
      
      IF v_user_prediction = v_winning_result THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END LOOP;
    
    -- Update grid with results
    UPDATE public.user_loto_foot_grids
    SET 
      correct_predictions = v_correct_count,
      status = CASE 
        WHEN v_correct_count >= 12 THEN 'won'
        ELSE 'lost'
      END
    WHERE id = v_grid.id;
    
    -- Insert win record if won
    IF v_correct_count >= 12 THEN
      INSERT INTO public.loto_foot_wins (
        grid_id,
        draw_date,
        correct_predictions,
        prize_rank,
        prize_amount
      ) VALUES (
        v_grid.id,
        p_draw_date,
        v_correct_count,
        CASE 
          WHEN v_correct_count = 15 THEN 1
          WHEN v_correct_count = 14 THEN 2
          WHEN v_correct_count = 13 THEN 3
          WHEN v_correct_count = 12 THEN 4
          ELSE NULL
        END,
        CASE 
          WHEN v_correct_count = 15 THEN 100000
          WHEN v_correct_count = 14 THEN 10000
          WHEN v_correct_count = 13 THEN 1000
          WHEN v_correct_count = 12 THEN 100
          ELSE 0
        END
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  -- Process group grids
  FOR v_grid IN 
    SELECT id, predictions, group_id
    FROM public.loto_foot_grids
    WHERE draw_date = p_draw_date AND status = 'pending'
  LOOP
    v_correct_count := 0;
    
    -- Compare each prediction
    FOR v_match_id IN SELECT jsonb_object_keys(v_grid.predictions)
    LOOP
      v_user_prediction := v_grid.predictions->>v_match_id;
      v_winning_result := p_winning_results->>v_match_id;
      
      IF v_user_prediction = v_winning_result THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END LOOP;
    
    -- Update grid with results
    UPDATE public.loto_foot_grids
    SET 
      correct_predictions = v_correct_count,
      status = CASE 
        WHEN v_correct_count >= 12 THEN 'won'
        ELSE 'lost'
      END
    WHERE id = v_grid.id;
    
    -- Insert win record if won
    IF v_correct_count >= 12 THEN
      INSERT INTO public.loto_foot_wins (
        grid_id,
        draw_date,
        correct_predictions,
        prize_rank,
        prize_amount
      ) VALUES (
        v_grid.id,
        p_draw_date,
        v_correct_count,
        CASE 
          WHEN v_correct_count = 15 THEN 1
          WHEN v_correct_count = 14 THEN 2
          WHEN v_correct_count = 13 THEN 3
          WHEN v_correct_count = 12 THEN 4
          ELSE NULL
        END,
        CASE 
          WHEN v_correct_count = 15 THEN 100000
          WHEN v_correct_count = 14 THEN 10000
          WHEN v_correct_count = 13 THEN 1000
          WHEN v_correct_count = 12 THEN 100
          ELSE 0
        END
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;