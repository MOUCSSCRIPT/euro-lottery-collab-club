import React from 'react';
import { LotoFootPrediction, GridCalculation } from '@/types/loto-foot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Coins, TrendingUp, Grid3X3 } from 'lucide-react';
import { MIN_PREDICTIONS } from '@/utils/lotoFootCosts';

interface LotoFootSummaryProps {
  predictions: LotoFootPrediction[];
  calculation: GridCalculation;
  isValid: boolean;
}

export const LotoFootSummary = ({
  predictions,
  calculation,
  isValid
}: LotoFootSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const validPredictionsCount = predictions.filter(p => p.predictions.length > 0).length;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Récapitulatif de votre grille
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut de la grille</span>
          <Badge variant={isValid ? "default" : "secondary"}>
            {isValid ? "Valide" : `${MIN_PREDICTIONS - validPredictionsCount} pronostics manquants`}
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Grid3X3 className="h-4 w-4" />
              Combinaisons
            </div>
            <div className="text-2xl font-bold">
              {calculation.totalCombinations.toLocaleString('fr-FR')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Coût total
            </div>
            <div className="text-2xl font-bold text-primary">
              {calculation.totalCost} SC
            </div>
            <div className="text-xs text-muted-foreground">
              ≈ {formatCurrency(calculation.totalCost * 0.04)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Mise par grille
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.minStake)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Gain potentiel max
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculation.potentialWinnings)}
            </div>
            <div className="text-xs text-muted-foreground">
              Pour 15 bons résultats
            </div>
          </div>
        </div>

        {/* Predictions Summary */}
        {predictions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Détail de vos pronostics</h4>
            <div className="space-y-1">
              {predictions.map(prediction => (
                <div key={prediction.match_position} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Match {prediction.match_position}
                  </span>
                  <div className="flex gap-1">
                    {prediction.predictions.map(pred => (
                      <Badge key={pred} variant="outline" className="text-xs px-1">
                        {pred}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Message */}
        {!isValid && (
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground text-center">
            Sélectionnez au moins {MIN_PREDICTIONS} pronostics pour valider votre grille
          </div>
        )}
      </CardContent>
    </Card>
  );
};