-- Create join requests table for team membership approval system
CREATE TABLE public.team_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

-- Enable RLS
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for team join requests
CREATE POLICY "Users can create join requests"
ON public.team_join_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.team_join_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Team creators can view and manage requests for their teams"
ON public.team_join_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = team_join_requests.group_id 
    AND groups.created_by = auth.uid()
  )
);

-- Add unique constraint to prevent duplicate requests
ALTER TABLE public.team_join_requests 
ADD CONSTRAINT unique_user_group_request 
UNIQUE (user_id, group_id);

-- Create index for better performance
CREATE INDEX idx_team_join_requests_group_id ON public.team_join_requests(group_id);
CREATE INDEX idx_team_join_requests_status ON public.team_join_requests(status);