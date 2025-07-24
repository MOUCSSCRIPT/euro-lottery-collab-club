-- Create table to track coin purchases
CREATE TABLE public.coin_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents (e.g., 1000 = 10€)
  coins INTEGER NOT NULL,  -- Number of coins purchased
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for coin purchases
CREATE POLICY "Users can view their own purchases" ON public.coin_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can insert purchases" ON public.coin_purchases
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Edge functions can update purchases" ON public.coin_purchases
  FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_coin_purchases_updated_at
  BEFORE UPDATE ON public.coin_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();