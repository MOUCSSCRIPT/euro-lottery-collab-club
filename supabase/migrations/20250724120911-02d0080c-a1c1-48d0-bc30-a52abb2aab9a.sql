-- Add phone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT;

-- Create index for phone lookup
CREATE INDEX idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;