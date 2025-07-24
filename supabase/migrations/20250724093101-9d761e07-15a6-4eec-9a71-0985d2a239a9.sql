-- Changer le type de la colonne coins de integer à numeric pour supporter les valeurs décimales
ALTER TABLE public.profiles 
ALTER COLUMN coins TYPE NUMERIC USING coins::NUMERIC;