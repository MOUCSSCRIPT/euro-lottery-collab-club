import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GridModeSelector } from '@/components/grids/GridModeSelector';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown';
import { usePersonalEuromillionsGrids } from '@/hooks/usePersonalEuromillionsGrids';
import { useProfile } from '@/hooks/useProfile';
import { getNextDrawDate } from '@/utils/drawDates';
import { getPlayDeadline } from '@/utils/playDeadlines';
import { Zap, Clock } from 'lucide-react';

type GridMode = 'auto' | 'manual';

export const EuromillionsQuickPlay = () => {
  const [budget, setBudget] = useState(10);
  const [playerName, setPlayerName] = useState('');
  const [gridMode, setGridMode] = useState<GridMode>('auto');
  const [euromillionsOptions, setEuromillionsOptions] = useState({
    multiple: false,
    plus: false,
    etoilePlus: false,
  });

  const { generateGrids, isGenerating } = usePersonalEuromillionsGrids();
  const { profile } = useProfile();

  // Calculate costs
  const baseGridCost = 2.50;
  const multiplier = euromillionsOptions.multiple ? 2 : 1;
  const plusCost = euromillionsOptions.plus ? 1 : 0;
  const etoilePlusCost = euromillionsOptions.etoilePlus ? 1 : 0;
  const costPerGrid = (baseGridCost + plusCost + etoilePlusCost) * multiplier;

  const maxGrids = Math.floor(budget / costPerGrid);
  const totalCost = maxGrids * costPerGrid;

  const nextDrawDate = getNextDrawDate('euromillions');
  const playDeadline = getPlayDeadline('euromillions');
  const isDeadlinePassed = playDeadline && new Date() > playDeadline;

  const canGenerate = !isDeadlinePassed && 
                     (profile?.coins || 0) >= totalCost && 
                     maxGrids > 0;

  const handleGenerate = () => {
    generateGrids({
      budget,
      playerName: playerName || undefined,
      euromillionsOptions,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Jeu Rapide EuroMillions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deadline warning */}
          {playDeadline && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Prochain tirage : {nextDrawDate}
              </span>
              <DeadlineCountdown deadline={playDeadline} />
            </div>
          )}

          {isDeadlinePassed && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ⏰ La date limite de jeu est dépassée
              </p>
              <p className="text-red-600 text-sm mt-1">
                Les grilles pour le prochain tirage ne peuvent plus être créées.
              </p>
            </div>
          )}

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

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="2.5"
                  step="0.1"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Max {maxGrids} grille{maxGrids > 1 ? 's' : ''} ({costPerGrid.toFixed(2)}€ par grille)
                </p>
              </div>

              <div className="space-y-3">
                <Label>Options FDJ</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple"
                      checked={euromillionsOptions.multiple}
                      onCheckedChange={(checked) => 
                        setEuromillionsOptions(prev => ({ ...prev, multiple: !!checked }))
                      }
                    />
                    <Label htmlFor="multiple" className="text-sm">Multiple (x2)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="plus"
                      checked={euromillionsOptions.plus}
                      onCheckedChange={(checked) => 
                        setEuromillionsOptions(prev => ({ ...prev, plus: !!checked }))
                      }
                    />
                    <Label htmlFor="plus" className="text-sm">Plus (+1€)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="etoile-plus"
                      checked={euromillionsOptions.etoilePlus}
                      onCheckedChange={(checked) => 
                        setEuromillionsOptions(prev => ({ ...prev, etoilePlus: !!checked }))
                      }
                    />
                    <Label htmlFor="etoile-plus" className="text-sm">Étoile+ (+1€)</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Vos SuerteCoins</span>
                  <SuerteCoinsDisplay 
                    amount={profile?.coins || 0} 
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {maxGrids} grille{maxGrids > 1 ? 's' : ''}
                  </span>
                  <SuerteCoinsDisplay 
                    amount={totalCost} 
                    size="sm"
                    variant={totalCost > (profile?.coins || 0) ? 'error' : 'default'}
                  />
                </div>
              </div>

              {!canGenerate && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    {isDeadlinePassed ? 'Date limite dépassée' : 
                     totalCost > (profile?.coins || 0) ? 'SuerteCoins insuffisants' :
                     maxGrids === 0 ? 'Budget insuffisant' : 'Impossible de générer'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 hover:opacity-90"
            size="lg"
          >
            {isGenerating ? 'Génération en cours...' : `Générer ${maxGrids} grille${maxGrids > 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};