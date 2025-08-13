-- Restrict groups management to admins and adjust grids visibility

-- Drop overly permissive policies on groups
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='groups' AND policyname='Allow insert groups') THEN
    DROP POLICY "Allow insert groups" ON public.groups;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='groups' AND policyname='Users can create their own groups') THEN
    DROP POLICY "Users can create their own groups" ON public.groups;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='groups' AND policyname='Allow update groups') THEN
    DROP POLICY "Allow update groups" ON public.groups;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='groups' AND policyname='Group creators can update their groups') THEN
    DROP POLICY "Group creators can update their groups" ON public.groups;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='groups' AND policyname='Allow delete groups') THEN
    DROP POLICY "Allow delete groups" ON public.groups;
  END IF;
END $$;

-- Create strict admin-only management policies on groups
CREATE POLICY IF NOT EXISTS "Admins can manage groups"
ON public.groups
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Keep select open (if not already). If an explicit policy exists, we keep it.
-- Otherwise, ensure at least one select policy exists.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='groups' AND command='SELECT'
  ) THEN
    CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);
  END IF;
END $$;

-- Update group_grids policies: admin sees/manages all, users only their own rows
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='group_grids' AND policyname='Group creators can manage grids') THEN
    DROP POLICY "Group creators can manage grids" ON public.group_grids;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='group_grids' AND policyname='Group members can create grids') THEN
    DROP POLICY "Group members can create grids" ON public.group_grids;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='group_grids' AND policyname='Users can view group grids for their groups') THEN
    DROP POLICY "Users can view group grids for their groups" ON public.group_grids;
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can manage all grids" 
ON public.group_grids
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Users can insert their own grids" 
ON public.group_grids
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their own grids" 
ON public.group_grids
FOR SELECT
USING (created_by = auth.uid());

-- No user-level update/delete policy to prevent edits; only admins can manage via the above policy

-- Update loto_foot_grids policies similarly
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loto_foot_grids' AND policyname='Group creators can manage loto foot grids') THEN
    DROP POLICY "Group creators can manage loto foot grids" ON public.loto_foot_grids;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loto_foot_grids' AND policyname='Group members can create loto foot grids') THEN
    DROP POLICY "Group members can create loto foot grids" ON public.loto_foot_grids;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loto_foot_grids' AND policyname='Users can view loto foot grids for their groups') THEN
    DROP POLICY "Users can view loto foot grids for their groups" ON public.loto_foot_grids;
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can manage all loto foot grids" 
ON public.loto_foot_grids
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Users can insert their own loto foot grids" 
ON public.loto_foot_grids
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their own loto foot grids" 
ON public.loto_foot_grids
FOR SELECT
USING (created_by = auth.uid());