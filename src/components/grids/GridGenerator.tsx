
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGenerateGrids } from '@/hooks/useGrids';
import { Tables } from '@/integrations/supabase/types';
import { EuromillionsOptionsComponent } from './EuromillionsOptions';
import { EuromillionsManualEntry } from './EuromillionsManualEntry';
import { LotoFootManualEntry } from './LotoFootManualEntry';
import { GridModeSelector } from './GridModeSelector';
import { EuromillionsOptions } from '@/types/euromillions';
import { GridGeneratorHeader } from './generator/GridGeneratorHeader';
import { PlayerNameInput } from './generator/PlayerNameInput';
import { BudgetInput } from './generator/BudgetInput';
import { GridCalculations } from './generator/GridCalculations';
import { GameInfoCard } from './generator/GameInfoCard';
import { GenerateButton } from './generator/GenerateButton';
import { ValidationMessages } from './generator/ValidationMessages';

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

  return (
    <div className="space-y-6">
      {/* Informations du joueur */}
      <Card className="w-full">
        <GridGeneratorHeader gridsLabel={gridsLabel} />
        <CardContent className="space-y-6">
          <PlayerNameInput 
            playerName={playerName} 
            onPlayerNameChange={setPlayerName} 
          />

          <BudgetInput 
            budget={budget} 
            onBudgetChange={setBudget} 
          />

          <Separator />

          <GridCalculations
            maxGrids={maxGrids}
            totalCost={totalCost}
            memberCount={memberCount}
            costPerMember={costPerMember}
            gridsLabel={gridsLabel}
          />

          <GameInfoCard gameType={group.game_type} />
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

      <GenerateButton
        canGenerate={canGenerate()}
        isGenerating={generateGrids.isPending}
        gridMode={gridMode}
        completeGridsCount={getCompleteGridsCount()}
        maxGrids={maxGrids}
        gridsLabel={gridsLabel}
        onGenerate={handleGenerate}
      />

      <ValidationMessages
        maxGrids={maxGrids}
        gridCost={gridCost}
        playerName={playerName}
        gridMode={gridMode}
        completeGridsCount={getCompleteGridsCount()}
        gridLabel={gridLabel}
      />
    </div>
  );
};
