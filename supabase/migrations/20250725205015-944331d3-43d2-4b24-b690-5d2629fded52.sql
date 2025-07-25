-- Add play deadline column to groups table
ALTER TABLE public.groups 
ADD COLUMN play_deadline TIMESTAMP WITH TIME ZONE;

-- Update existing groups with a default play deadline (next draw date at 20:15 CET)
UPDATE public.groups 
SET play_deadline = CASE 
  WHEN next_draw_date IS NOT NULL THEN 
    next_draw_date + INTERVAL '20 hours 15 minutes'
  ELSE 
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '20 hours 15 minutes'
END
WHERE play_deadline IS NULL;