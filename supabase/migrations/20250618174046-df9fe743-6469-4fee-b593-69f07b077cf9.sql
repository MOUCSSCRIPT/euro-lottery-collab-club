
-- Create grids table to store generated game grids
CREATE TABLE public.group_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  grid_number INTEGER NOT NULL,
  numbers INTEGER[] NOT NULL,
  stars INTEGER[],
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  draw_date DATE,
  is_active BOOLEAN DEFAULT true
);

-- Create draws table to track lottery draws
CREATE TABLE public.draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type game_type NOT NULL,
  draw_date DATE NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  winning_stars INTEGER[],
  jackpot DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.group_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

-- Users can view grids for groups they're members of
CREATE POLICY "Users can view group grids for their groups" 
  ON public.group_grids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_grids.group_id 
      AND (
        groups.created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.group_members 
          WHERE group_members.group_id = groups.id 
          AND group_members.user_id = auth.uid()
        )
      )
    )
  );

-- Group creators can manage grids
CREATE POLICY "Group creators can manage grids" 
  ON public.group_grids 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_grids.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Anyone can view draws (public information)
CREATE POLICY "Anyone can view draws" 
  ON public.draws 
  FOR SELECT 
  USING (true);

-- Only authenticated users can create draws (admin functionality)
CREATE POLICY "Authenticated users can manage draws" 
  ON public.draws 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);
