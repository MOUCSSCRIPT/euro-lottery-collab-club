
-- Add instance_index and group_grid_id columns to user_loto_foot_grids
ALTER TABLE public.user_loto_foot_grids
ADD COLUMN instance_index integer NOT NULL DEFAULT 1,
ADD COLUMN group_grid_id uuid;

-- Index for fast duplicate detection and grouping
CREATE INDEX idx_user_loto_foot_grids_draw_date_predictions ON public.user_loto_foot_grids (draw_date);
CREATE INDEX idx_user_loto_foot_grids_group_grid_id ON public.user_loto_foot_grids (group_grid_id);
