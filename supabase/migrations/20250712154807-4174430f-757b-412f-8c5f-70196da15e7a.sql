-- Fix infinite recursion in group_members RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Allow select group_members" ON public.group_members;
DROP POLICY IF EXISTS "Allow insert group_members" ON public.group_members;
DROP POLICY IF EXISTS "Allow update group_members" ON public.group_members;
DROP POLICY IF EXISTS "Allow delete group_members" ON public.group_members;

-- Create a security definer function to check group membership safely
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = check_group_id AND user_id = check_user_id
  );
$$;

-- Create a security definer function to check if user is group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(check_group_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = check_group_id AND created_by = check_user_id
  );
$$;

-- Recreate policies without recursion
CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
ON public.group_members
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view group members of accessible groups"
ON public.group_members
FOR SELECT
USING (
  public.is_group_creator(group_id, auth.uid()) OR 
  public.is_group_member(group_id, auth.uid())
);