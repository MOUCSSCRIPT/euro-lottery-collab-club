
-- Create enum for game types
CREATE TYPE game_type AS ENUM ('euromillions', 'lotto', 'lotto_foot_15');

-- Create enum for group modes
CREATE TYPE group_mode AS ENUM ('demo', 'real');

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_type game_type NOT NULL DEFAULT 'euromillions',
  mode group_mode NOT NULL DEFAULT 'real',
  max_members INTEGER NOT NULL DEFAULT 10,
  total_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  grids_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  next_draw_date DATE,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  contribution DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view groups they are members of" 
  ON public.groups 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own groups" 
  ON public.groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
  ON public.groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members of their groups" 
  ON public.group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id AND (
        created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.group_members gm2 
          WHERE gm2.group_id = group_id AND gm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join groups" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
  ON public.group_members 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
  ON public.group_members 
  FOR DELETE 
  USING (auth.uid() = user_id);
