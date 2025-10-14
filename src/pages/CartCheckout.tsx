import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { CartGridPreview } from '@/components/cart/CartGridPreview';
import { useCartStore } from '@/hooks/useCartStore';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CartCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const { grids, removeGrid, clearCart, getTotalCost } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCost = getTotalCost();
  const hasInsufficientCoins = (profile?.coins || 0) < totalCost;

  useEffect(() => {
    document.title = 'Panier – Valider vos grilles | SuertePlus';
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleValidateGrids = async () => {
    if (grids.length === 0 || hasInsufficientCoins || !user) return;

    setIsProcessing(true);

    try {
      // Optimistic update
      const newCoinsAmount = (profile?.coins || 0) - totalCost;
      queryClient.setQueryData(['profile', user.id], (old: any) => ({
        ...old,
        coins: newCoinsAmount
      }));

      // Check for duplicates before inserting
      const { data: existingGrids } = await supabase
        .from('user_loto_foot_grids')
        .select('predictions, draw_date')
        .eq('user_id', user.id)
        .in('draw_date', [...new Set(grids.map(g => g.drawDate))]);

      // Filter out duplicates
      const uniqueGrids = grids.filter(grid => {
        const isDuplicate = existingGrids?.some(existing => 
          existing.draw_date === grid.drawDate &&
          JSON.stringify(existing.predictions) === JSON.stringify(grid.predictions)
        );
        return !isDuplicate;
      });

      if (uniqueGrids.length === 0) {
        throw new Error('Toutes ces grilles existent déjà');
      }

      if (uniqueGrids.length < grids.length) {
        toast({
          title: 'Attention',
          description: `${grids.length - uniqueGrids.length} grille(s) dupliquée(s) ignorée(s)`,
        });
      }

      // Insert unique grids
      const gridInserts = uniqueGrids.map(grid => ({
        user_id: user.id,
        predictions: grid.predictions,
        player_name: grid.playerName || null,
        draw_date: grid.drawDate,
        cost: grid.cost,
        stake: 2,
        potential_winnings: 0,
        is_active: true,
        status: 'pending',
      }));

      const { error: gridsError } = await supabase
        .from('user_loto_foot_grids')
        .insert(gridInserts);

      if (gridsError) throw gridsError;

      // Update user coins
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: newCoinsAmount })
        .eq('user_id', user.id);

      if (coinsError) throw coinsError;

      // Success
      clearCart();
      
      toast({
        title: 'Grilles validées !',
        description: `${grids.length} grille${grids.length > 1 ? 's' : ''} enregistrée${grids.length > 1 ? 's' : ''} avec succès.`,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-loto-foot-grids'] });

      navigate('/jouer');
    } catch (error) {
      console.error('Error validating grids:', error);
      
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: 'Erreur',
        description: 'Impossible de valider vos grilles. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (grids.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <MobileHeader title="Panier" showBack className="md:hidden" />
        
        <main className="container mx-auto px-4 pt-8 pb-28">
          <div className="max-w-2xl mx-auto text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8">
              Ajoutez des grilles pour commencer à jouer
            </p>
            <Button onClick={() => navigate('/jouer')} size="lg">
              Commencer à jouer
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <MobileHeader title="Panier" showBack className="md:hidden" />

      <main className="container mx-auto px-4 pt-4 pb-28">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Votre panier</h1>

          {/* Grids list */}
          <div className="space-y-4 mb-6">
            {grids.map(grid => (
              <CartGridPreview 
                key={grid.id} 
                grid={grid} 
                onRemove={removeGrid} 
              />
            ))}
          </div>

          {/* Summary card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nombre de grilles</span>
                <span className="font-medium">{grids.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Vos SuerteCoins</span>
                <SuerteCoinsDisplay amount={profile?.coins || 0} size="md" />
              </div>
              
              <div className="flex items-center justify-between text-lg font-bold border-t pt-4">
                <span>Total à payer</span>
                <SuerteCoinsDisplay 
                  amount={totalCost} 
                  size="lg"
                  variant={hasInsufficientCoins ? 'error' : 'success'}
                />
              </div>

              {hasInsufficientCoins && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">
                    SuerteCoins insuffisants. Vous avez besoin de {(totalCost - (profile?.coins || 0)).toFixed(1)} SuerteCoins supplémentaires.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/panier')}
                    className="mt-2 w-full"
                  >
                    Acheter des SuerteCoins
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleValidateGrids}
              disabled={hasInsufficientCoins || isProcessing || grids.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                `Valider mes ${grids.length} grille${grids.length > 1 ? 's' : ''}`
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/jouer')}
              className="w-full"
              size="lg"
            >
              Ajouter d'autres grilles
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartCheckout;
