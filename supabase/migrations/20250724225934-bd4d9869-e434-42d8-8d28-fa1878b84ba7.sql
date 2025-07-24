-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles without recursive RLS issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table policies to allow admin access
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to add coins (admin only)
CREATE OR REPLACE FUNCTION public.add_coins_to_user(_user_id UUID, _amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Accès refusé. Seuls les administrateurs peuvent ajouter des coins.';
  END IF;

  -- Update user coins
  UPDATE public.profiles
  SET coins = coins + _amount,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé.';
  END IF;

  RETURN TRUE;
END;
$$;

-- Create function to set coins (admin only)
CREATE OR REPLACE FUNCTION public.set_user_coins(_user_id UUID, _amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Accès refusé. Seuls les administrateurs peuvent modifier les coins.';
  END IF;

  -- Update user coins
  UPDATE public.profiles
  SET coins = _amount,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé.';
  END IF;

  RETURN TRUE;
END;
$$;