
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
import { EuromillionsOptions } from '@/types/euromillions';

interface GridGeneratorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

export const GridGenerator = ({ group, memberCount }: GridGeneratorProps) => {
  const [budget, setBudget] = useState(50);
  const [playerName, setPlayerName] = useState('');
  const [euromillionsOptions, setEuromillionsOptions] = useState<EuromillionsOptions>({
    gridCount: 1,
    luckyNumbers: false,
    system: ''
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
    generateGrids.mutate({
      groupId: group.id,
      budget,
      memberCount,
      gameType: group.game_type,
      playerName,
      euromillionsOptions: group.game_type === 'euromillions' ? euromillionsOptions : undefined
    });
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
              <div>• Coût par bulletin : 2,00€</div>
            </>
          )
        };
      default:
        return {
          description: <div>• Configuration par défaut</div>
        };
    }
  };

  const gridLabel = group.game_type === 'lotto_foot_15' ? 'bulletin' : 'grille';
  const gridsLabel = group.game_type === 'lotto_foot_15' ? 'bulletins' : 'grilles';

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5 text-blue-600" />
            Générateur de {gridsLabel}
          </CardTitle>
          <CardDescription>
            Générez automatiquement des {gridsLabel} optimisées pour votre groupe
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

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={maxGrids === 0 || generateGrids.isPending || !playerName.trim()}
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
                Générer {maxGrids} {maxGrids > 1 ? gridsLabel : gridLabel}
              </>
            )}
          </Button>

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
        </CardContent>
      </Card>

      {/* Euromillions Options */}
      {group.game_type === 'euromillions' && (
        <EuromillionsOptionsComponent 
          options={euromillionsOptions}
          onOptionsChange={setEuromillionsOptions}
        />
      )}
    </div>
  );
};
