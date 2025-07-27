-- Add loto_foot to game_type enum
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'loto_foot';

-- Create loto_foot_matches table
CREATE TABLE public.loto_foot_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL,
  match_position INTEGER NOT NULL CHECK (match_position >= 1 AND match_position <= 15),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_odds NUMERIC(4,2) NOT NULL DEFAULT 2.50,
  draw_odds NUMERIC(4,2) NOT NULL DEFAULT 3.20,
  away_odds NUMERIC(4,2) NOT NULL DEFAULT 2.80,
  match_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  result TEXT CHECK (result IN ('1', 'X', '2')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(draw_date, match_position)
);

-- Enable RLS
ALTER TABLE public.loto_foot_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view loto foot matches" 
ON public.loto_foot_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage loto foot matches" 
ON public.loto_foot_matches 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for timestamps
CREATE TRIGGER update_loto_foot_matches_updated_at
BEFORE UPDATE ON public.loto_foot_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create loto_foot_grids table to store user predictions
CREATE TABLE public.loto_foot_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  grid_number INTEGER NOT NULL,
  predictions JSONB NOT NULL, -- Array of predictions for each match position
  stake NUMERIC NOT NULL DEFAULT 2,
  potential_winnings NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  draw_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  player_name TEXT,
  FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Enable RLS for loto_foot_grids
ALTER TABLE public.loto_foot_grids ENABLE ROW LEVEL SECURITY;

-- Create policies for loto_foot_grids
CREATE POLICY "Group creators can manage loto foot grids" 
ON public.loto_foot_grids 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM groups 
  WHERE groups.id = loto_foot_grids.group_id 
  AND groups.created_by = auth.uid()
));

CREATE POLICY "Group members can create loto foot grids" 
ON public.loto_foot_grids 
FOR INSERT 
WITH CHECK (EXISTS ( 
  SELECT 1 FROM group_members 
  WHERE group_members.group_id = loto_foot_grids.group_id 
  AND group_members.user_id = auth.uid()
));

CREATE POLICY "Users can view loto foot grids for their groups" 
ON public.loto_foot_grids 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM groups 
  WHERE groups.id = loto_foot_grids.group_id 
  AND (groups.created_by = auth.uid() OR EXISTS ( 
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  ))
));

-- Create loto_foot_wins table
CREATE TABLE public.loto_foot_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grid_id UUID NOT NULL,
  draw_date DATE NOT NULL,
  correct_predictions INTEGER NOT NULL,
  prize_rank INTEGER,
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (grid_id) REFERENCES public.loto_foot_grids(id) ON DELETE CASCADE
);

-- Enable RLS for loto_foot_wins
ALTER TABLE public.loto_foot_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view wins for their accessible loto foot grids" 
ON public.loto_foot_wins 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM loto_foot_grids lfg
  JOIN groups g ON g.id = lfg.group_id
  WHERE lfg.id = loto_foot_wins.grid_id 
  AND (g.created_by = auth.uid() OR EXISTS ( 
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = g.id 
    AND gm.user_id = auth.uid()
  ))
));

CREATE POLICY "System can manage loto foot wins" 
ON public.loto_foot_wins 
FOR ALL 
USING (auth.uid() IS NOT NULL);