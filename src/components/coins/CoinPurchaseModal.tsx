import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';

interface CoinPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const coinPackages = [
  { coins: 100, price: 10, popular: false },
  { coins: 250, price: 25, popular: true },
  { coins: 500, price: 50, popular: false },
  { coins: 1000, price: 100, popular: false },
];

export const CoinPurchaseModal = ({ open, onOpenChange }: CoinPurchaseModalProps) => {
  const [loading, setLoading] = useState<number | null>(null);

  const handlePurchase = async (coins: number) => {
    try {
      setLoading(coins);
      
      const { data, error } = await supabase.functions.invoke('purchase-coins', {
        body: { coins }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onOpenChange(false);
        
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Stripe pour finaliser votre achat.",
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Acheter des SuerteCoins
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            1€ = 10 SuerteCoins
          </div>
          
          <div className="grid gap-3">
            {coinPackages.map((pack) => (
              <Card 
                key={pack.coins} 
                className={`relative transition-all hover:shadow-md ${
                  pack.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <SuerteCoinsDisplay amount={pack.coins} size="lg" />
                    <span className="text-2xl font-bold">{pack.price}€</span>
                  </CardTitle>
                  <CardDescription>
                    {pack.coins} SuerteCoins pour {pack.price}€
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    onClick={() => handlePurchase(pack.coins)}
                    disabled={loading !== null}
                    className="w-full"
                    variant={pack.popular ? "default" : "outline"}
                  >
                    {loading === pack.coins ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Acheter maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Paiement sécurisé via Stripe
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};