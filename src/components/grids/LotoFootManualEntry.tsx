
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trophy, Calculator, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LotoFootGrid {
  id: string;
  predictions: number[][]; // Array de 15 matchs, chaque match contient un array des sélections (1, 2, et/ou 3)
  cost: number;
  code: string;
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
    { id: '1', predictions: Array(15).fill([]), cost: 2.0, code: '' }
  ]);

  // Calculer le nombre de doubles et triples pour une grille
  const countDoublesAndTriples = (predictions: number[][]) => {
    let doubles = 0, triples = 0;
    for (let i = 0; i < 15; i++) {
      const selections = predictions[i] || [];
      if (selections.length === 2) doubles++;
      else if (selections.length === 3) triples++;
    }
    return { doubles, triples };
  };

  // Calculer le prix d'une grille
  const calculateGridCost = (predictions: number[][]) => {
    const { doubles, triples } = countDoublesAndTriples(predictions);
    const baseCost = 2.0;
    const multiplier = Math.pow(2, doubles) * Math.pow(3, triples);
    return baseCost * multiplier;
  };

  // Générer le code unique d'une grille
  const generateGridCode = (predictions: number[][]) => {
    let code = '';
    for (let i = 0; i < 15; i++) {
      const selections = (predictions[i] || []).sort();
      code += selections.map(val => val === 2 ? 'N' : val.toString()).join('') + '|';
    }
    return code;
  };

  // Vérifier si une grille est un sous-ensemble d'une autre
  const isSubsetGrid = (code1: string, code2: string) => {
    const tab1 = code1.split('|');
    const tab2 = code2.split('|');
    for (let i = 0; i < 15; i++) {
      const set1 = new Set(tab1[i]);
      const set2 = new Set(tab2[i]);
      for (let c of set1) {
        if (!set2.has(c)) return false;
      }
    }
    return true;
  };

  // Mettre à jour une grille
  const updateGrid = (gridId: string, newPredictions: number[][]) => {
    const cost = calculateGridCost(newPredictions);
    const code = generateGridCode(newPredictions);
    
    const updatedGrids = grids.map(grid => {
      if (grid.id === gridId) {
        return { ...grid, predictions: newPredictions, cost, code };
      }
      return grid;
    });
    
    setGrids(updatedGrids);
    onGridsChange(updatedGrids);
  };

  const addGrid = () => {
    if (grids.length < maxGrids) {
      const newGrid = {
        id: Date.now().toString(),
        predictions: Array(15).fill([]),
        cost: 2.0,
        code: ''
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

  const togglePrediction = (gridId: string, matchIndex: number, prediction: number) => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) return;

    const newPredictions = [...grid.predictions];
    const currentSelections = newPredictions[matchIndex] || [];
    
    if (currentSelections.includes(prediction)) {
      // Retirer la sélection
      newPredictions[matchIndex] = currentSelections.filter(p => p !== prediction);
    } else {
      // Ajouter la sélection
      newPredictions[matchIndex] = [...currentSelections, prediction].sort();
    }
    
    updateGrid(gridId, newPredictions);
  };

  const isGridComplete = (grid: LotoFootGrid) => {
    return grid.predictions.every(match => match.length > 0);
  };

  const getGridValidation = (grid: LotoFootGrid) => {
    const existingCodes = grids.filter(g => g.id !== grid.id).map(g => g.code);
    
    // Vérifier le coût maximum
    if (grid.cost > 324) {
      return { isValid: false, message: "Coût > 324€ ! Réduisez les doubles/triples." };
    }
    
    // Vérifier les doublons exacts
    if (existingCodes.includes(grid.code) && grid.code !== '') {
      return { isValid: false, message: "Cette grille a déjà été créée !" };
    }
    
    // Vérifier les sous-ensembles
    for (const existingCode of existingCodes) {
      if (existingCode !== '' && grid.code !== '' && isSubsetGrid(grid.code, existingCode)) {
        return { isValid: false, message: "Une grille contenant vos choix existe déjà !" };
      }
    }
    
    return { isValid: true, message: "" };
  };

  const allGridsValid = grids.every(grid => {
    const validation = getGridValidation(grid);
    return isGridComplete(grid) && validation.isValid;
  });

  const getTotalCost = () => {
    return grids.reduce((total, grid) => total + grid.cost, 0);
  };

  return (
    <div className="space-y-4">
      {grids.map((grid, index) => {
        const { doubles, triples } = countDoublesAndTriples(grid.predictions);
        const validation = getGridValidation(grid);
        const isComplete = isGridComplete(grid);
        
        return (
          <Card key={grid.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  Bulletin {index + 1}
                  {isComplete && validation.isValid ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Valide
                    </Badge>
                  ) : !validation.isValid ? (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Erreur
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      En cours
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
              {/* Erreur de validation */}
              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{validation.message}</span>
                </div>
              )}

              {/* Informations sur le coût */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-blue-600">Coût</div>
                  <div className="text-lg font-bold text-blue-800">{grid.cost.toFixed(2)}€</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600">Doubles</div>
                  <div className="text-lg font-bold text-blue-800">{doubles}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600">Triples</div>
                  <div className="text-lg font-bold text-blue-800">{triples}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600">Multiplicateur</div>
                  <div className="text-lg font-bold text-blue-800">
                    {Math.pow(2, doubles) * Math.pow(3, triples)}x
                  </div>
                </div>
              </div>

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
                  <div>• Vous pouvez sélectionner <strong>plusieurs résultats par match</strong></div>
                </div>
              </div>

              {/* Grille des pronostics */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Match</th>
                      <th className="border border-gray-200 p-2 text-center w-16">1</th>
                      <th className="border border-gray-200 p-2 text-center w-16">N</th>
                      <th className="border border-gray-200 p-2 text-center w-16">2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchLabels.map((matchLabel, matchIndex) => (
                      <tr key={matchIndex} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-2 font-medium">
                          {matchLabel}
                        </td>
                        {predictionOptions.map((option) => {
                          const isSelected = (grid.predictions[matchIndex] || []).includes(option.value);
                          return (
                            <td 
                              key={option.value} 
                              className={cn(
                                "border border-gray-200 p-2 text-center cursor-pointer transition-colors",
                                isSelected ? "bg-blue-100" : "hover:bg-gray-100"
                              )}
                              onClick={() => togglePrediction(grid.id, matchIndex, option.value)}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-all",
                                isSelected 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              )}>
                                {option.label}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aperçu du bulletin */}
              {grid.predictions.some(match => match.length > 0) && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Aperçu du bulletin :
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const selections = grid.predictions[i] || [];
                      const displaySelections = selections.map(val => val === 2 ? 'N' : val.toString()).join('');
                      return (
                        <div key={i} className="flex justify-between items-center p-1 bg-white rounded">
                          <span className="font-medium">M{i + 1}:</span>
                          <span className={cn(
                            "font-bold",
                            selections.length === 0 ? "text-gray-400" : 
                            selections.length === 1 ? "text-green-600" :
                            selections.length === 2 ? "text-orange-600" : "text-red-600"
                          )}>
                            {displaySelections || '--'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

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

      {/* Résumé global */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-orange-800">
                  <strong>{grids.filter(g => isGridComplete(g) && getGridValidation(g).isValid).length}</strong> 
                  {' '}bulletin(s) valide(s) sur <strong>{grids.length}</strong>
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Coût total : <strong>{getTotalCost().toFixed(2)}€</strong>
                </p>
              </div>
              {allGridsValid && (
                <Badge className="bg-green-600">
                  Prêt à jouer !
                </Badge>
              )}
            </div>
            
            {!allGridsValid && (
              <div className="text-xs text-orange-600">
                Complétez et corrigez tous les bulletins pour continuer
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
