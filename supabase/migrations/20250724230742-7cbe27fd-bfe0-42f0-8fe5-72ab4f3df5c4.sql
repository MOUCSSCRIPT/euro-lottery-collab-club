-- Add unique constraint to prevent duplicate grids in the same group
CREATE UNIQUE INDEX unique_group_grid_combination 
ON public.group_grids (group_id, numbers, stars);