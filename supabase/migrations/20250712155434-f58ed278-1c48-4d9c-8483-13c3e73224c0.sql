-- Add team code to groups table
ALTER TABLE public.groups ADD COLUMN team_code TEXT UNIQUE;

-- Create function to generate team codes
CREATE OR REPLACE FUNCTION public.generate_team_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a random 8-character code (letters and numbers)
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    -- Ensure uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE team_code = code);
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update existing groups with team codes
UPDATE public.groups 
SET team_code = public.generate_team_code() 
WHERE team_code IS NULL;

-- Make team_code not null after updating existing records
ALTER TABLE public.groups ALTER COLUMN team_code SET NOT NULL;
ALTER TABLE public.groups ALTER COLUMN team_code SET DEFAULT public.generate_team_code();

-- Create index for better performance
CREATE INDEX idx_groups_team_code ON public.groups(team_code);