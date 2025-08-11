import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const coinPackages = [
  { key: 'decouverte', label: 'Pack découverte', coins: 100, price: 5, description: 'Parfait pour commencer à jouer', popular: false },
  { key: 'standard', label: 'Pack standard', coins: 200, price: 10, description: 'Pour les joueurs réguliers', popular: true },
  { key: 'premium', label: 'Pack premium', coins: 1000, price: 50, description: 'Pour les passionnés de jeux', popular: false },
  { key: 'ultime', label: 'Pack ultime', coins: 2000, price: 100, description: 'Pour les joueurs les plus ambitieux', popular: false },
];

const Cart = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Minimal SEO for the page
  useEffect(() => {
    document.title = 'Panier – Acheter des SuerteCoins';

    const metaDesc = document.querySelector('meta[name="description"]');
    const content = 'Acheter des SuerteCoins: choisissez votre pack et payez en toute sécurité.';
    if (metaDesc) {
      metaDesc.setAttribute('content', content);
    } else {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      m.setAttribute('content', content);
      document.head.appendChild(m);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/panier`);
  }, []);

  const handlePurchase = async (coins: number) => {
    try {
      if (!user) {
        navigate('/auth');
        return;
      }
      setLoading(coins);
      const { data, error } = await supabase.functions.invoke('purchase-coins', {
        body: { coins },
      });
      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout (new tab to be consistent across devices)
        window.open(data.url, '_blank');
        toast({
          title: 'Redirection vers le paiement',
          description: 'Vous allez être redirigé vers Stripe pour finaliser votre achat.',
        });
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la session de paiement.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />

      <MobileHeader title="Acheter des SuerteCoins" showBack className="md:hidden" />

      <main className="container mx-auto px-4 pt-4 pb-28 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">Acheter des SuerteCoins</h1>
          <p className="text-muted-foreground text-center mb-6">Choisissez votre pack</p>

          <section className="grid gap-4" aria-label="Packs SuerteCoins disponibles">
            {coinPackages.map((pack) => (
              <Card
                key={pack.key}
                className={`relative transition-all hover:shadow-md rounded-xl ${pack.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {pack.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}

                <CardHeader className="pt-6 pb-2">
                  <CardTitle className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">{pack.label}</span>
                      <div className="flex items-center gap-2">
                        <SuerteCoinsDisplay amount={pack.coins} size="lg" />
                        <span className="text-2xl font-extrabold tracking-tight">{pack.price}€</span>
                      </div>
                      <CardDescription className="mt-1">{pack.description}</CardDescription>
                    </div>
                    <img
                      src="/placeholder.svg"
                      alt={`Illustration ${pack.label} SuerteCoins`}
                      className="w-40 h-24 rounded-lg object-cover hidden sm:block"
                      loading="lazy"
                    />
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => handlePurchase(pack.coins)}
                    disabled={loading !== null}
                    className="w-full h-11"
                    variant={pack.popular ? 'default' : 'outline'}
                    aria-label={`Acheter ${pack.coins} SuerteCoins pour ${pack.price}€`}
                  >
                    {loading === pack.coins ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Acheter maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          <aside className="text-xs text-muted-foreground text-center mt-4">
            Paiement sécurisé via Stripe
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cart;
