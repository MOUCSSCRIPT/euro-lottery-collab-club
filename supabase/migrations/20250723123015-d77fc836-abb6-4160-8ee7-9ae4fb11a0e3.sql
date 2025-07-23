-- Mettre à jour tous les groupes existants pour être euromillions
UPDATE public.groups 
SET game_type = 'euromillions' 
WHERE game_type != 'euromillions';

-- Mettre à jour tous les tirages existants pour être euromillions  
UPDATE public.draws 
SET game_type = 'euromillions' 
WHERE game_type != 'euromillions';

-- Supprimer la colonne default temporairement pour éviter les erreurs de cast
ALTER TABLE public.groups ALTER COLUMN game_type DROP DEFAULT;
ALTER TABLE public.draws ALTER COLUMN game_type DROP DEFAULT;

-- Renommer l'ancien type
ALTER TYPE public.game_type RENAME TO game_type_old;

-- Créer le nouveau type avec seulement euromillions
CREATE TYPE public.game_type AS ENUM ('euromillions');

-- Mettre à jour les colonnes pour utiliser le nouveau type
ALTER TABLE public.groups 
ALTER COLUMN game_type TYPE public.game_type 
USING 'euromillions'::public.game_type;

ALTER TABLE public.draws 
ALTER COLUMN game_type TYPE public.game_type 
USING 'euromillions'::public.game_type;

-- Remettre les defaults
ALTER TABLE public.groups ALTER COLUMN game_type SET DEFAULT 'euromillions'::public.game_type;

-- Supprimer l'ancien type
DROP TYPE public.game_type_old;