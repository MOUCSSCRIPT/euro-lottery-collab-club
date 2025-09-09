import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { usePersonalLotoFootGrids } from '@/hooks/usePersonalLotoFootGrids';
import { useProfile } from '@/hooks/useProfile';
import { getNextDrawDate } from '@/utils/drawDates';
import { Gamepad2, Clock } from 'lucide-react';

export const LotoFootQuickPlay = () => {
  const [playerName, setPlayerName] = useState('');
  const [predictions, setPredictions] = useState<Record<string, string>>({});

  const nextDrawDate = getNextDrawDate('loto_foot');
  const { data: matches, isLoading: matchesLoading } = useLotoFootMatches(nextDrawDate);
  const { generateGrid, isGenerating } = usePersonalLotoFootGrids();
  const { profile } = useProfile();

  const predictionCount = Object.keys(predictions).length;
  const isValidGrid = predictionCount >= 12;
  const totalCost = 2;
  const canGenerate = isValidGrid && (profile?.coins || 0) >= totalCost;

  const handlePredictionChange = (matchId: string, prediction: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: prediction
    }));
  };

  const handleGenerate = () => {
    if (!isValidGrid) return;
    
    generateGrid({
      predictions,
      playerName: playerName || undefined,
      drawDate: nextDrawDate,
    });
  };

  if (matchesLoading) {
    return <div className="p-8 text-center">Chargement des matchs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-green-500" />
            Jeu Rapide Loto Foot 15
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Prochain tirage : {nextDrawDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player-name">Votre nom (optionnel)</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
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
                    variant={totalCost > (profile?.coins || 0) ? 'error' : 'default'}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Pronostics sélectionnés
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {predictionCount}/15
                </p>
                <p className="text-xs text-muted-foreground">
                  Minimum 12 requis
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {!canGenerate && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    {predictionCount < 12 ? `Sélectionnez ${12 - predictionCount} pronostic${12 - predictionCount > 1 ? 's' : ''} de plus` :
                     totalCost > (profile?.coins || 0) ? 'SuerteCoins insuffisants' : 'Erreur'}
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:opacity-90"
                size="lg"
              >
                {isGenerating ? 'Génération en cours...' : 'Générer la grille'}
              </Button>
            </div>
          </div>

          {/* Matches list */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Sélectionnez vos pronostics</h3>
            <div className="grid gap-3">
              {matches?.map((match, index) => (
                <Card key={match.id} className="p-4">
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
                        size="sm"
                        onClick={() => handlePredictionChange(match.id, pred)}
                        className={`flex-1 transition-all duration-200 ${
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
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};