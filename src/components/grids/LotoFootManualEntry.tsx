import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LotoFootGridCard } from './loto-foot/LotoFootGridCard';
import { LotoFootSummaryCard } from './loto-foot/LotoFootSummaryCard';

interface LotoFootGrid {
  id: string;
  predictions: number[][];
  cost: number;
  code: string;
}

interface LotoFootManualEntryProps {
  onGridsChange: (grids: LotoFootGrid[]) => void;
  maxGrids: number;
}

export const LotoFootManualEntry = ({ onGridsChange, maxGrids }: LotoFootManualEntryProps) => {
  const [grids, setGrids] = useState<LotoFootGrid[]>([
    { id: '1', predictions: Array(15).fill([]), cost: 1.0, code: '' }
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
    const baseCost = 1.0;
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
        cost: 1.0,
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

  const validGridsCount = grids.filter(g => isGridComplete(g) && getGridValidation(g).isValid).length;
  const allGridsValid = grids.every(grid => {
    const validation = getGridValidation(grid);
    return isGridComplete(grid) && validation.isValid;
  });
  const totalCost = grids.reduce((total, grid) => total + grid.cost, 0);

  return (
    <div className="space-y-4">
      {grids.map((grid, index) => {
        const { doubles, triples } = countDoublesAndTriples(grid.predictions);
        const multiplier = Math.pow(2, doubles) * Math.pow(3, triples);
        const validation = getGridValidation(grid);
        const isComplete = isGridComplete(grid);
        
        return (
          <LotoFootGridCard
            key={grid.id}
            grid={grid}
            index={index}
            canRemove={grids.length > 1}
            onRemove={() => removeGrid(grid.id)}
            onTogglePrediction={(matchIndex, prediction) => 
              togglePrediction(grid.id, matchIndex, prediction)
            }
            isComplete={isComplete}
            isValid={validation.isValid}
            validationMessage={validation.message}
            doubles={doubles}
            triples={triples}
            multiplier={multiplier}
          />
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
      <LotoFootSummaryCard
        validGridsCount={validGridsCount}
        totalGridsCount={grids.length}
        totalCost={totalCost}
        allGridsValid={allGridsValid}
      />
    </div>
  );
};
