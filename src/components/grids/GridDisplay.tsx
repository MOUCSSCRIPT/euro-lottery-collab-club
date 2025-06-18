
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GridData } from '@/hooks/useGrids';
import { Star, Hash } from 'lucide-react';

interface GridDisplayProps {
  grids: GridData[];
  gameType: 'euromillions' | 'lotto';
}

export const GridDisplay = ({ grids, gameType }: GridDisplayProps) => {
  if (!grids || grids.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Aucune grille générée pour le moment.
            <br />
            Utilisez le générateur ci-dessus pour créer vos grilles.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Grilles générées</h3>
        <Badge variant="secondary">
          {grids.length} grille{grids.length > 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {grids.map((grid) => (
          <Card key={grid.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Grille #{grid.grid_number}
                </span>
                <Badge variant="outline">{grid.cost}€</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Numbers */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Numéros :
                  </span>
                  <div className="flex gap-1">
                    {grid.numbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stars (for Euromillions) */}
                {gameType === 'euromillions' && grid.stars && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Étoiles :
                    </span>
                    <div className="flex gap-1">
                      {grid.stars.map((star, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
                        >
                          {star}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Draw Date */}
                {grid.draw_date && (
                  <div className="text-xs text-muted-foreground">
                    Tirage du {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total grilles</div>
              <div className="text-lg font-bold">{grids.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Coût total</div>
              <div className="text-lg font-bold">
                {grids.reduce((sum, grid) => sum + Number(grid.cost), 0).toFixed(2)}€
              </div>
            </div>
            <div className="md:col-span-1 col-span-2">
              <div className="text-sm text-muted-foreground">Prochain tirage</div>
              <div className="text-lg font-bold">
                {grids[0]?.draw_date ? 
                  new Date(grids[0].draw_date).toLocaleDateString('fr-FR') : 
                  'Non défini'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
