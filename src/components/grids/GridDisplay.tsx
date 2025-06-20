
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GridData } from '@/hooks/useGrids';
import { Star, Hash, Trophy } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

interface GridDisplayProps {
  grids: GridData[];
  gameType: GameType;
}

export const GridDisplay = ({ grids, gameType }: GridDisplayProps) => {
  if (!grids || grids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grilles générées</CardTitle>
          <CardDescription>
            Aucune grille n'a encore été générée pour ce groupe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Utilisez le générateur ci-dessus pour créer vos grilles
          </div>
        </CardContent>
      </Card>
    );
  }

  const gridLabel = gameType === 'lotto_foot_15' ? 'Bulletins' : 'Grilles';
  const totalCost = grids.reduce((sum, grid) => sum + grid.cost, 0);

  const renderGridContent = (grid: GridData) => {
    switch (gameType) {
      case 'euromillions':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Hash className="h-4 w-4 text-blue-600" />
                <div className="flex space-x-1">
                  {grid.numbers.map((num, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
              {grid.stars && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="flex space-x-1">
                    {grid.stars.map((star, idx) => (
                      <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {star}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {grid.cost.toFixed(2)}€
            </div>
          </div>
        );
      
      case 'lotto':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4 text-green-600" />
              <div className="flex space-x-1">
                {grid.numbers.map((num, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {grid.cost.toFixed(2)}€
            </div>
          </div>
        );
      
      case 'lotto_foot_15':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-purple-600" />
              <div className="flex space-x-1 flex-wrap">
                {grid.numbers.map((prediction, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    M{idx + 1}: {prediction === 1 ? '1' : prediction === 2 ? 'N' : '2'}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {grid.cost.toFixed(2)}€
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {grid.numbers.map((num, idx) => (
                <Badge key={idx} variant="outline">
                  {num}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {grid.cost.toFixed(2)}€
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{gridLabel} générées</CardTitle>
            <CardDescription>
              {grids.length} {grids.length > 1 ? gridLabel.toLowerCase() : gridLabel.toLowerCase().slice(0, -1)} 
              {gameType === 'lotto_foot_15' ? '' : 's'} pour un total de {totalCost.toFixed(2)}€
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {gameType.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grids.map((grid) => (
            <Card key={grid.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">
                  {gameType === 'lotto_foot_15' ? 'Bulletin' : 'Grille'} #{grid.grid_number}
                </h4>
                {grid.draw_date && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
              </div>
              {renderGridContent(grid)}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
