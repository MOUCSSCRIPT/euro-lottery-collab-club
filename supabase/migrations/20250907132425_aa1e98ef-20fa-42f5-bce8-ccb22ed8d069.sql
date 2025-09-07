-- Remove odds columns from loto_foot_matches table
ALTER TABLE public.loto_foot_matches 
DROP COLUMN IF EXISTS home_odds,
DROP COLUMN IF EXISTS draw_odds,
DROP COLUMN IF EXISTS away_odds;