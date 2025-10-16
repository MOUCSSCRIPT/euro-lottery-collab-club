-- Create table for published grids
CREATE TABLE public.loto_foot_published_grids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  play_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.loto_foot_published_grids ENABLE ROW LEVEL SECURITY;

-- Anyone can view published grids
CREATE POLICY "Anyone can view published grids"
  ON public.loto_foot_published_grids FOR SELECT
  USING (status = 'published');

-- Admins can manage all grids
CREATE POLICY "Admins can manage all grids"
  ON public.loto_foot_published_grids FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_loto_foot_published_grids_updated_at
  BEFORE UPDATE ON public.loto_foot_published_grids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();