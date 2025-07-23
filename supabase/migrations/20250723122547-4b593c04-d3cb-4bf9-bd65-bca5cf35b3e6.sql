-- Supprimer les anciens types de jeux et ne garder que euromillions
ALTER TYPE public.game_type RENAME TO game_type_old;
CREATE TYPE public.game_type AS ENUM ('euromillions');

-- Mettre à jour la table groups pour utiliser le nouveau type
ALTER TABLE public.groups 
ALTER COLUMN game_type TYPE public.game_type 
USING game_type::text::public.game_type;

-- Mettre à jour la table draws pour utiliser le nouveau type  
ALTER TABLE public.draws 
ALTER COLUMN game_type TYPE public.game_type 
USING game_type::text::public.game_type;

-- Supprimer l'ancien type
DROP TYPE public.game_type_old;