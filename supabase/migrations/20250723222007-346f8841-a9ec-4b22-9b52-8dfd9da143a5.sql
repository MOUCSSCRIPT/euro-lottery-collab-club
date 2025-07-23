-- Ajouter le nom du joueur et l'utilisateur qui a créé la grille dans la table group_grids
ALTER TABLE public.group_grids 
ADD COLUMN player_name TEXT,
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Mettre à jour les grilles existantes avec un nom par défaut
UPDATE public.group_grids 
SET player_name = 'Joueur', 
    created_by = (SELECT created_by FROM public.groups WHERE groups.id = group_grids.group_id)
WHERE player_name IS NULL;