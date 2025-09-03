-- Create personal grids tables without groups dependency

-- Table for personal Euromillions grids
CREATE TABLE public.user_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numbers INTEGER[] NOT NULL,
  stars INTEGER[] NOT NULL,
  cost NUMERIC NOT NULL,
  grid_number INTEGER,
  player_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  draw_date DATE,
  is_active BOOLEAN DEFAULT true
);

-- Table for personal Loto Foot grids
CREATE TABLE public.user_loto_foot_grids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  predictions JSONB NOT NULL,
  stake NUMERIC NOT NULL DEFAULT 2,
  potential_winnings NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  draw_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  player_name TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.user_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loto_foot_grids ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_grids
CREATE POLICY "Users can manage their own grids" 
ON public.user_grids 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_loto_foot_grids
CREATE POLICY "Users can manage their own loto foot grids" 
ON public.user_loto_foot_grids 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_grids_user_created ON public.user_grids (user_id, created_at DESC);
CREATE INDEX idx_user_loto_foot_grids_user_created ON public.user_loto_foot_grids (user_id, created_at DESC);
CREATE INDEX idx_user_grids_draw_date ON public.user_grids (draw_date);
CREATE INDEX idx_user_loto_foot_grids_draw_date ON public.user_loto_foot_grids (draw_date);