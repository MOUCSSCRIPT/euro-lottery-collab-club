
-- 1. Supprimer les anciennes policies pour éviter les doublons
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create their own groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- 2. Créer une vue pour casser la récursion
CREATE OR REPLACE VIEW public.accessible_group_ids AS
SELECT group_id
FROM public.group_members
WHERE user_id = auth.uid();

-- 3. Créer les nouvelles policies sur la table groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
USING (
  auth.uid() = created_by OR
  id IN (SELECT group_id FROM public.accessible_group_ids)
);

CREATE POLICY "Users can create their own groups"
ON public.groups
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "Group creators can update their groups"
ON public.groups
FOR UPDATE
USING (
  auth.uid() = created_by
);

-- 4. Créer les nouvelles policies sur la table group_members
CREATE POLICY "Users can view group members of their groups"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own membership"
ON public.group_members
FOR UPDATE
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (
  auth.uid() = user_id
);
