-- Create table for Loto Foot 15 matches configuration
CREATE TABLE public.loto_foot_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  match_position INTEGER NOT NULL CHECK (match_position >= 1 AND match_position <= 15),
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, match_position)
);

-- Enable Row Level Security
ALTER TABLE public.loto_foot_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for loto foot matches
CREATE POLICY "Group creators can manage loto foot matches" 
ON public.loto_foot_matches 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM groups 
  WHERE groups.id = loto_foot_matches.group_id 
  AND groups.created_by = auth.uid()
));

CREATE POLICY "Group members can view loto foot matches" 
ON public.loto_foot_matches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM groups 
  WHERE groups.id = loto_foot_matches.group_id 
  AND (groups.created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  ))
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_loto_foot_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loto_foot_matches_updated_at
BEFORE UPDATE ON public.loto_foot_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_loto_foot_matches_updated_at();