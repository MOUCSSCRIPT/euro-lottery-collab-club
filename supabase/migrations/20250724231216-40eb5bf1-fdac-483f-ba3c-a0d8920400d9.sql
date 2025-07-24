-- Step 1: Clean up existing duplicates in group_grids table
-- Keep only the oldest record for each unique combination of (group_id, numbers, stars)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY group_id, numbers, stars 
      ORDER BY created_at ASC
    ) as rn
  FROM public.group_grids
  WHERE is_active = true
)
DELETE FROM public.group_grids 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS unique_group_grid_combination 
ON public.group_grids (group_id, numbers, stars) 
WHERE is_active = true;