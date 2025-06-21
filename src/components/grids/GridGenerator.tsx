import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dices, Calculator, Users, Euro } from 'lucide-react';
import { useGenerateGrids } from '@/hooks/useGrids';
import { Tables } from '@/integrations/supabase/types';
import { EuromillionsOptionsComponent } from './EuromillionsOptions';
import { EuromillionsManualEntry } from './EuromillionsManualEntry';
import { LotoFootManualEntry } from './LotoFootManualEntry';
import { GridModeSelector } from './GridModeSelector';
import { EuromillionsOptions } from '@/types/euromillions';

interface GridGeneratorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

type GridMode = 'auto' | 'manual';

interface ManualGrid {
  id: string;
  mainNumbers: number[];
  stars: number[];
}

interface LotoFootGrid {
  id: string;
  predictions: number[][];
  cost: number;
  code: string;
}

export const GridGenerator = ({ group, memberCount }: GridGeneratorProps) => {
  const [budget, setBudget] = useState(50);
  const [playerName, setPlayerName] = useState('');
  const [gridMode, setGridMode] = useState<GridMode>('auto');
  const [manualGrids, setManualGrids] = useState<ManualGrid[]>([]);
  const [lotoFootGrids, setLotoFootGrids] = useState<LotoFootGrid[]>([]);
  const [euromillionsOptions, setEuromillionsOptions] = useState<EuromillionsOptions>({
    gridCount: 1,
    luckyNumbers: false,
    system: 'none'
  });
  
  const generateGrids = useGenerateGrids();

  const getGridCost = () => {
    switch (group.game_type) {
      case 'euromillions':
        return 2.5;
      case 'lotto':
        return 2.2;
      case 'lotto_foot_15':
        return 2.0;
      default:
        return 2.5;
    }
  };

  const gridCost = getGridCost();
  const maxGrids = Math.floor(budget / gridCost);
  const totalCost = maxGrids * gridCost;
  const costPerMember = totalCost / memberCount;

  const handleGenerate = () => {
    if (gridMode === 'manual') {
      if (group.game_type === 'lotto_foot_15') {
        // Convertir les grilles Loto Foot au format attendu par le backend
        const validGrids = lotoFootGrids.filter(grid => 
          grid.predictions.every(match => match.length > 0)
        );
        
        const convertedGrids = validGrids.map(grid => ({
          id: grid.id,
          predictions: grid.predictions.map(match => {
            // Si plusieurs sélections, prendre la première pour la compatibilité
            // Dans une version avancée, on pourrait gérer les systèmes
            return match.length > 0 ? match[0] : 1;
          })
        }));

        generateGrids.mutate({
          groupId: group.id,
          budget,
          memberCount,
          gameType: group.game_type,
          playerName,
          lotoFootGrids: convertedGrids
        });
      } else {
        // Pour l'Euromillions
        generateGrids.mutate({
          groupId: group.id,
          budget,
          memberCount,
          gameType: group.game_type,
          playerName,
          manualGrids: manualGrids.filter(grid => 
            grid.mainNumbers.length === 5 && grid.stars.length === 2
          )
        });
      }
    } else {
      // Génération automatique existante
      generateGrids.mutate({
        groupId: group.id,
        budget,
        memberCount,
        gameType: group.game_type,
        playerName,
        euromillionsOptions: group.game_type === 'euromillions' ? euromillionsOptions : undefined
      });
    }
  };

  const gridLabel = group.game_type === 'lotto_foot_15' ? 'bulletin' : 'grille';
  const gridsLabel = group.game_type === 'lotto_foot_15' ? 'bulletins' : 'grilles';

  const canGenerate = () => {
    if (!playerName.trim()) return false;
    if (maxGrids === 0) return false;
    
    if (gridMode === 'manual') {
      if (group.game_type === 'lotto_foot_15') {
        const completeGrids = lotoFootGrids.filter(grid => 
          grid.predictions.every(match => match.length > 0)
        );
        return completeGrids.length > 0;
      } else {
        const completeGrids = manualGrids.filter(grid => 
          grid.mainNumbers.length === 5 && grid.stars.length === 2
        );
        return completeGrids.length > 0;
      }
    }
    
    return true;
  };

  const getCompleteGridsCount = () => {
    if (group.game_type === 'lotto_foot_15') {
      return lotoFootGrids.filter(grid => 
        grid.predictions.every(match => match.length > 0)
      ).length;
    }
    return manualGrids.filter(grid => 
      grid.mainNumbers.length === 5 && grid.stars.length === 2
    ).length;
  };

  const getGameInfo = () => {
    switch (group.game_type) {
      case 'euromillions':
        return {
          description: (
            <>
              <div>• 5 numéros de 1 à 50</div>
              <div>• 2 étoiles de 1 à 12</div>
              <div>• Coût par grille : 2,50€</div>
              <div>• Options : Numéros Chance, Systèmes</div>
            </>
          )
        };
      case 'lotto':
        return {
          description: (
            <>
              <div>• 6 numéros de 1 à 49</div>
              <div>• Coût par grille : 2,20€</div>
            </>
          )
        };
      case 'lotto_foot_15':
        return {
          description: (
            <>
              <div>• 15 matchs à pronostiquer</div>
              <div>• 1, N ou 2 pour chaque match</div>
              <div>• Coût par bulletin : 2,00€ (minimum)</div>
              <div>• Coût calculé selon les doubles/triples</div>
              <div>• 1 = Victoire équipe domicile</div>
              <div>• N = Match nul</div>
              <div>• 2 = Victoire équipe extérieur</div>
            </>
          )
        };
      default:
        return {
          description: <div>• Configuration par défaut</div>
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations du joueur */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5 text-blue-600" />
            Générateur de {gridsLabel}
          </CardTitle>
          <CardDescription>
            Générez automatiquement des {gridsLabel} optimisées ou choisissez vos numéros manuellement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Name */}
          <div className="space-y-2">
            <Label htmlFor="player-name">Votre nom</Label>
            <Input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Votre nom dans le groupe"
            />
          </div>

          {/* Budget Input */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget total du groupe (€)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min="1"
              step="1"
            />
          </div>

          <Separator />

          {/* Calculations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">{gridsLabel.charAt(0).toUpperCase() + gridsLabel.slice(1)} max</div>
                <div className="text-xl font-bold text-blue-600">{maxGrids}</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <Euro className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Coût total</div>
                <div className="text-xl font-bold text-green-600">{totalCost.toFixed(2)}€</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Membres</div>
                <div className="text-xl font-bold text-purple-600">{memberCount}</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Euro className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Par membre</div>
                <div className="text-xl font-bold text-yellow-600">{costPerMember.toFixed(2)}€</div>
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Type de jeu</h4>
              <Badge variant="secondary" className="capitalize">
                {group.game_type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {getGameInfo().description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode de génération (seulement pour Euromillions et Loto Foot 15) */}
      {(group.game_type === 'euromillions' || group.game_type === 'lotto_foot_15') && (
        <GridModeSelector mode={gridMode} onModeChange={setGridMode} />
      )}

      {/* Options Euromillions (mode automatique seulement) */}
      {group.game_type === 'euromillions' && gridMode === 'auto' && (
        <EuromillionsOptionsComponent 
          options={euromillionsOptions}
          onOptionsChange={setEuromillionsOptions}
        />
      )}

      {/* Saisie manuelle Euromillions */}
      {group.game_type === 'euromillions' && gridMode === 'manual' && maxGrids > 0 && (
        <EuromillionsManualEntry 
          onGridsChange={setManualGrids}
          maxGrids={maxGrids}
        />
      )}

      {/* Saisie manuelle Loto Foot 15 */}
      {group.game_type === 'lotto_foot_15' && gridMode === 'manual' && maxGrids > 0 && (
        <LotoFootManualEntry 
          onGridsChange={setLotoFootGrids}
          maxGrids={maxGrids}
        />
      )}

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate}
        disabled={!canGenerate() || generateGrids.isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
        size="lg"
      >
        {generateGrids.isPending ? (
          <>
            <Dices className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Dices className="mr-2 h-4 w-4" />
            {gridMode === 'manual' 
              ? `Valider ${getCompleteGridsCount()} ${getCompleteGridsCount() > 1 ? gridsLabel : gridLabel}`
              : `Générer ${maxGrids} ${maxGrids > 1 ? gridsLabel : gridLabel}`
            }
          </>
        )}
      </Button>

      {/* Messages d'erreur */}
      {maxGrids === 0 && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Budget insuffisant. Minimum requis : {gridCost}€
        </div>
      )}

      {!playerName.trim() && (
        <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
          Veuillez saisir votre nom pour continuer
        </div>
      )}

      {gridMode === 'manual' && getCompleteGridsCount() === 0 && maxGrids > 0 && (
        <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          Complétez au moins une {gridLabel} pour continuer
        </div>
      )}
    </div>
  );
};
