
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

interface GridGeneratorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

export const GridGenerator = ({ group, memberCount }: GridGeneratorProps) => {
  const [budget, setBudget] = useState(50);
  const generateGrids = useGenerateGrids();

  const gridCost = group.game_type === 'euromillions' ? 2.5 : 2.2;
  const maxGrids = Math.floor(budget / gridCost);
  const totalCost = maxGrids * gridCost;
  const costPerMember = totalCost / memberCount;

  const handleGenerate = () => {
    generateGrids.mutate({
      groupId: group.id,
      budget,
      memberCount,
      gameType: group.game_type
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5 text-blue-600" />
          Générateur de grilles
        </CardTitle>
        <CardDescription>
          Générez automatiquement des grilles optimisées pour votre groupe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <div className="text-sm text-muted-foreground">Grilles max</div>
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
              {group.game_type}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {group.game_type === 'euromillions' ? (
              <>
                <div>• 5 numéros de 1 à 50</div>
                <div>• 2 étoiles de 1 à 12</div>
                <div>• Coût par grille : 2,50€</div>
              </>
            ) : (
              <>
                <div>• 6 numéros de 1 à 49</div>
                <div>• Coût par grille : 2,20€</div>
              </>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={maxGrids === 0 || generateGrids.isPending}
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
              Générer {maxGrids} grille{maxGrids > 1 ? 's' : ''}
            </>
          )}
        </Button>

        {maxGrids === 0 && (
          <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            Budget insuffisant. Minimum requis : {gridCost}€
          </div>
        )}
      </CardContent>
    </Card>
  );
};
