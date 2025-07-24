-- Permettre aux membres du groupe de créer des grilles
CREATE POLICY "Group members can create grids" 
ON public.group_grids 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_grids.group_id 
    AND user_id = auth.uid()
  )
);