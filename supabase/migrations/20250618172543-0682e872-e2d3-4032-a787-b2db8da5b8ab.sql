
-- Create invitations table
CREATE TABLE public.group_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  invitation_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for invitations
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Group creators can manage invitations for their groups
CREATE POLICY "Group creators can manage invitations" 
  ON public.group_invitations 
  FOR ALL 
  USING (
    invited_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_invitations.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Anyone can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to them" 
  ON public.group_invitations 
  FOR SELECT 
  USING (
    email = auth.jwt() ->> 'email' OR
    invitation_code IN (
      SELECT unnest(string_to_array(current_setting('request.headers', true)::json ->> 'invitation-code', ','))
    )
  );

-- Create function to generate invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a random 8-character code
  code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.group_invitations WHERE invitation_code = code) LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  END LOOP;
  
  RETURN code;
END;
$$;
