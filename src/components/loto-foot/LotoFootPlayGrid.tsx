import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { useProfile } from '@/hooks/useProfile';
import { useCartStore } from '@/hooks/useCartStore';
import { getNextDrawDate } from '@/utils/drawDates';
import { Clock, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LotoFootPlayGrid = () => {
  const [playerName, setPlayerName] = useState('');
  const [predictions, setPredictions] = useState<Record<string, string>>({});

  const nextDrawDate = getNextDrawDate('loto_foot');
  const { data: matches, isLoading: matchesLoading } = useLotoFootMatches(nextDrawDate);
  const { profile } = useProfile();
  const addGrid = useCartStore(state => state.addGrid);

  const predictionCount = Object.keys(predictions).length;
  const isValidGrid = predictionCount >= 12;
  const totalCost = 2;
  const canAddToCart = isValidGrid;

  const handlePredictionChange = (matchId: string, prediction: string) => {
    setPredictions(prev => {
      const newPredictions = { ...prev };
      if (newPredictions[matchId] === prediction) {
        delete newPredictions[matchId];
      } else {
        newPredictions[matchId] = prediction;
      }
      return newPredictions;
    });
  };

  const handleAddToCart = () => {
    if (!isValidGrid) return;
    
    addGrid({
      predictions,
      playerName: playerName || undefined,
      drawDate: nextDrawDate,
      cost: totalCost,
    });
    
    toast({
      title: 'Grille ajoutée au panier !',
      description: 'Vous pouvez continuer à jouer ou payer maintenant.',
    });
    
    // Reset form
    setPredictions({});
    setPlayerName('');
  };

  if (matchesLoading) {
    return <div className="p-8 text-center">Chargement des matchs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          Prochain tirage : {nextDrawDate}
        </span>
      </div>

      {/* Player info and cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player-name">Votre nom (optionnel)</Label>
          <Input
            id="player-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Votre nom"
          />
        </div>

        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Vos SuerteCoins</span>
            <SuerteCoinsDisplay 
              amount={profile?.coins || 0} 
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Coût grille</span>
            <SuerteCoinsDisplay 
              amount={totalCost} 
              size="sm"
              variant="default"
            />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">
          Pronostics sélectionnés
        </p>
        <p className="text-3xl font-bold text-primary">
          {predictionCount}/15
        </p>
        <p className="text-xs text-muted-foreground">
          Minimum 12 requis
        </p>
      </div>

      {/* Matches list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Sélectionnez vos pronostics</h3>
        <div className="grid gap-3">
          {matches?.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-4">
                <div className="mb-3">
                  <span className="font-medium text-sm">
                    {match.home_team} vs {match.away_team}
                  </span>
                </div>
                <div className="flex gap-2">
                  {['1', 'X', '2'].map((pred) => (
                    <Button
                      key={pred}
                      variant="outline"
                      size="lg"
                      onClick={() => handlePredictionChange(match.id, pred)}
                      className={`flex-1 font-bold transition-all duration-200 ${
                        predictions[match.id] === pred 
                          ? pred === '1' 
                            ? 'bg-prediction-1 text-prediction-1-foreground hover:bg-prediction-1/90 border-prediction-1' 
                            : pred === 'X' 
                            ? 'bg-prediction-x text-prediction-x-foreground hover:bg-prediction-x/90 border-prediction-x'
                            : 'bg-prediction-2 text-prediction-2-foreground hover:bg-prediction-2/90 border-prediction-2'
                          : ''
                      }`}
                    >
                      {pred}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add to cart button */}
      <div className="sticky bottom-20 md:bottom-6 z-10">
        {!canAddToCart && (
          <div className="p-3 mb-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <p className="text-orange-800 text-sm font-medium">
              {predictionCount < 12 
                ? `Sélectionnez ${12 - predictionCount} pronostic${12 - predictionCount > 1 ? 's' : ''} de plus` 
                : 'Complétez votre grille'}
            </p>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Ajouter au panier (2 SC)
        </Button>
      </div>
    </div>
  );
};
