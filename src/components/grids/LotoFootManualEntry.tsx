
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LotoFootGrid {
  id: string;
  predictions: number[]; // Array de 15 prédictions (1, 2, ou 3 pour 1/N/2)
}

interface LotoFootManualEntryProps {
  onGridsChange: (grids: LotoFootGrid[]) => void;
  maxGrids: number;
}

const matchLabels = [
  "Match 1", "Match 2", "Match 3", "Match 4", "Match 5",
  "Match 6", "Match 7", "Match 8", "Match 9", "Match 10",
  "Match 11", "Match 12", "Match 13", "Match 14", "Match 15"
];

const predictionOptions = [
  { value: 1, label: '1', description: 'Victoire équipe domicile', color: 'bg-green-600 hover:bg-green-700' },
  { value: 2, label: 'N', description: 'Match nul', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { value: 3, label: '2', description: 'Victoire équipe extérieur', color: 'bg-red-600 hover:bg-red-700' }
];

export const LotoFootManualEntry = ({ onGridsChange, maxGrids }: LotoFootManualEntryProps) => {
  const [grids, setGrids] = useState<LotoFootGrid[]>([
    { id: '1', predictions: [] }
  ]);

  const addGrid = () => {
    if (grids.length < maxGrids) {
      const newGrid = {
        id: Date.now().toString(),
        predictions: []
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

  const setPrediction = (gridId: string, matchIndex: number, prediction: number) => {
    const updatedGrids = grids.map(grid => {
      if (grid.id === gridId) {
        const newPredictions = [...grid.predictions];
        newPredictions[matchIndex] = prediction;
        return { ...grid, predictions: newPredictions };
      }
      return grid;
    });
    
    setGrids(updatedGrids);
    onGridsChange(updatedGrids);
  };

  const isGridComplete = (grid: LotoFootGrid) => {
    return grid.predictions.length === 15 && grid.predictions.every(p => p >= 1 && p <= 3);
  };

  const allGridsComplete = grids.every(isGridComplete);

  const getCompletionPercentage = (grid: LotoFootGrid) => {
    const validPredictions = grid.predictions.filter(p => p >= 1 && p <= 3).length;
    return Math.round((validPredictions / 15) * 100);
  };

  return (
    <div className="space-y-4">
      {grids.map((grid, index) => (
        <Card key={grid.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                Bulletin {index + 1}
                {isGridComplete(grid) ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complet
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {getCompletionPercentage(grid)}%
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
          
          <CardContent className="space-y-4">
            {/* Instructions */}
            <div className="bg-orange-50 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Comment jouer :</span>
              </div>
              <div className="text-orange-700 space-y-1">
                <div>• <strong>1</strong> : Victoire de l'équipe à domicile</div>
                <div>• <strong>N</strong> : Match nul</div>
                <div>• <strong>2</strong> : Victoire de l'équipe à l'extérieur</div>
              </div>
            </div>

            {/* Grille des pronostics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchLabels.map((matchLabel, matchIndex) => (
                <div key={matchIndex} className="border rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2 text-center">
                    {matchLabel}
                  </div>
                  <div className="flex justify-center gap-1">
                    {predictionOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={grid.predictions[matchIndex] === option.value ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 text-xs font-bold",
                          grid.predictions[matchIndex] === option.value 
                            ? option.color + " text-white" 
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => setPrediction(grid.id, matchIndex, option.value)}
                        title={option.description}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Aperçu du bulletin */}
            {grid.predictions.some(p => p >= 1 && p <= 3) && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Aperçu du bulletin :</h5>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const prediction = grid.predictions[i];
                    const option = predictionOptions.find(opt => opt.value === prediction);
                    return (
                      <Badge 
                        key={i} 
                        variant={prediction ? "default" : "outline"}
                        className={cn(
                          "text-xs",
                          prediction ? "bg-gray-700 text-white" : "text-gray-400"
                        )}
                      >
                        {i + 1}: {option ? option.label : '--'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Progression */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">Progression</span>
                <span className="text-sm text-blue-600">
                  {grid.predictions.filter(p => p >= 1 && p <= 3).length}/15 matchs
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage(grid)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Bouton d'ajout de bulletin */}
      {grids.length < maxGrids && (
        <Button
          variant="outline"
          className="w-full border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50"
          onClick={addGrid}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bulletin ({grids.length}/{maxGrids})
        </Button>
      )}

      {/* Résumé */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-orange-800">
                <strong>{grids.filter(isGridComplete).length}</strong> bulletin(s) complet(s) sur <strong>{grids.length}</strong>
              </p>
              {!allGridsComplete && (
                <p className="text-xs text-orange-600 mt-1">
                  Complétez tous les bulletins pour continuer
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
