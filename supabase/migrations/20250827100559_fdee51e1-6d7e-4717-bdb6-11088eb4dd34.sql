
-- Renforcer les RLS pour que seuls les admins puissent gérer les matchs Loto Foot

-- 1) Supprimer la policy trop permissive si elle existe
DROP POLICY IF EXISTS "Authenticated users can manage loto foot matches" 
ON public.loto_foot_matches;

-- 2) Policies admin-only pour INSERT / UPDATE / DELETE
CREATE POLICY "Admins can insert loto foot matches"
ON public.loto_foot_matches
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update loto foot matches"
ON public.loto_foot_matches
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete loto foot matches"
ON public.loto_foot_matches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remarque: On conserve la policy existante
-- "Anyone can view loto foot matches" (SELECT true)
