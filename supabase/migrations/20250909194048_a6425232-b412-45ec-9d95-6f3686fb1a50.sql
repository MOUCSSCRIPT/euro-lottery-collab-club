-- Ajouter des politiques RLS pour permettre aux admins de voir toutes les grilles

-- Politique pour que les admins puissent voir toutes les grilles Loto Foot de groupe
CREATE POLICY "Admins can view all loto foot grids" 
ON public.loto_foot_grids 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour que les admins puissent voir toutes les grilles Loto Foot personnelles
CREATE POLICY "Admins can view all user loto foot grids" 
ON public.user_loto_foot_grids 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour que les admins puissent voir toutes les grilles EuroMillions de groupe
CREATE POLICY "Admins can view all group grids" 
ON public.group_grids 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour que les admins puissent voir toutes les grilles EuroMillions personnelles
CREATE POLICY "Admins can view all user grids" 
ON public.user_grids 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));