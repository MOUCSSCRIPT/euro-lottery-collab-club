
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualGrid {
  id: string;
  mainNumbers: number[];
  stars: number[];
}

interface EuromillionsManualEntryProps {
  onGridsChange: (grids: ManualGrid[]) => void;
  maxGrids: number;
}

export const EuromillionsManualEntry = ({ onGridsChange, maxGrids }: EuromillionsManualEntryProps) => {
  const [grids, setGrids] = useState<ManualGrid[]>([
    { id: '1', mainNumbers: [], stars: [] }
  ]);

  const addGrid = () => {
    if (grids.length < maxGrids) {
      const newGrid = {
        id: Date.now().toString(),
        mainNumbers: [],
        stars: []
      };
      const updatedGrids = [...grids, newGrid];
      setGrids(updatedGrids);
      onGridsChange(updatedGrids);
    }
  };

  const removeGrid = (gridId: string) => {
    if (grids.length > 1) {
      const updatedGrids = grids.filter(grid => grid.id !== gridId);
      setGrids(updatedGrids);
      onGridsChange(updatedGrids);
    }
  };

  const toggleMainNumber = (gridId: string, number: number) => {
    const updatedGrids = grids.map(grid => {
      if (grid.id === gridId) {
        const isSelected = grid.mainNumbers.includes(number);
        let newNumbers;
        
        if (isSelected) {
          newNumbers = grid.mainNumbers.filter(n => n !== number);
        } else if (grid.mainNumbers.length < 5) {
          newNumbers = [...grid.mainNumbers, number].sort((a, b) => a - b);
        } else {
          return grid;
        }
        
        return { ...grid, mainNumbers: newNumbers };
      }
      return grid;
    });
    
    setGrids(updatedGrids);
    onGridsChange(updatedGrids);
  };

  const toggleStar = (gridId: string, star: number) => {
    const updatedGrids = grids.map(grid => {
      if (grid.id === gridId) {
        const isSelected = grid.stars.includes(star);
        let newStars;
        
        if (isSelected) {
          newStars = grid.stars.filter(s => s !== star);
        } else if (grid.stars.length < 2) {
          newStars = [...grid.stars, star].sort((a, b) => a - b);
        } else {
          return grid;
        }
        
        return { ...grid, stars: newStars };
      }
      return grid;
    });
    
    setGrids(updatedGrids);
    onGridsChange(updatedGrids);
  };

  const isGridComplete = (grid: ManualGrid) => {
    return grid.mainNumbers.length === 5 && grid.stars.length === 2;
  };

  const allGridsComplete = grids.every(isGridComplete);

  return (
    <div className="space-y-4">
      {grids.map((grid, index) => (
        <Card key={grid.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                Grille {index + 1}
                {isGridComplete(grid) && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complète
                  </Badge>
                )}
              </CardTitle>
              {grids.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGrid(grid.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Numéros principaux */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium">Numéros principaux</h4>
                <Badge variant="outline" className="text-xs">
                  {grid.mainNumbers.length}/5
                </Badge>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 50 }, (_, i) => i + 1).map(number => (
                  <Button
                    key={number}
                    variant={grid.mainNumbers.includes(number) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-medium",
                      grid.mainNumbers.includes(number) 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "hover:bg-blue-50"
                    )}
                    onClick={() => toggleMainNumber(grid.id, number)}
                    disabled={!grid.mainNumbers.includes(number) && grid.mainNumbers.length >= 5}
                  >
                    {number}
                  </Button>
                ))}
              </div>
            </div>

            {/* Étoiles */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Étoiles</h4>
                <Badge variant="outline" className="text-xs">
                  {grid.stars.length}/2
                </Badge>
              </div>
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(star => (
                  <Button
                    key={star}
                    variant={grid.stars.includes(star) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-medium",
                      grid.stars.includes(star) 
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                        : "hover:bg-yellow-50"
                    )}
                    onClick={() => toggleStar(grid.id, star)}
                    disabled={!grid.stars.includes(star) && grid.stars.length >= 2}
                  >
                    {star}
                  </Button>
                ))}
              </div>
            </div>

            {/* Aperçu de la grille */}
            {(grid.mainNumbers.length > 0 || grid.stars.length > 0) && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Aperçu :</h5>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {grid.mainNumbers.map(num => (
                      <Badge key={num} className="bg-blue-600 text-white">
                        {num}
                      </Badge>
                    ))}
                    {Array.from({ length: 5 - grid.mainNumbers.length }).map((_, i) => (
                      <Badge key={i} variant="outline" className="text-gray-400">
                        --
                      </Badge>
                    ))}
                  </div>
                  <span className="text-gray-400">|</span>
                  <div className="flex gap-1">
                    {grid.stars.map(star => (
                      <Badge key={star} className="bg-yellow-500 text-white">
                        ⭐ {star}
                      </Badge>
                    ))}
                    {Array.from({ length: 2 - grid.stars.length }).map((_, i) => (
                      <Badge key={i} variant="outline" className="text-gray-400">
                        ⭐ --
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Bouton d'ajout de grille */}
      {grids.length < maxGrids && (
        <Button
          variant="dashed"
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          onClick={addGrid}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une grille ({grids.length}/{maxGrids})
        </Button>
      )}

      {/* Résumé */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-800">
                <strong>{grids.filter(isGridComplete).length}</strong> grille(s) complète(s) sur <strong>{grids.length}</strong>
              </p>
              {!allGridsComplete && (
                <p className="text-xs text-blue-600 mt-1">
                  Complétez toutes les grilles pour continuer
                </p>
              )}
            </div>
            {allGridsComplete && (
              <Badge className="bg-green-600">
                Prêt à jouer !
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
