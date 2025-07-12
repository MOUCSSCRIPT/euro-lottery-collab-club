
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
import { GridCalculations } from './generator/GridCalculations';
import { GameInfoCard } from './generator/GameInfoCard';
import { GenerateButton } from './generator/GenerateButton';
import { ValidationMessages } from './generator/ValidationMessages';
import { useAuth } from '@/contexts/AuthContext';

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
  const [budget] = useState(50); // Budget fixe limité à 50€
  const [gridMode, setGridMode] = useState<GridMode>('auto');
  const [manualGrids, setManualGrids] = useState<ManualGrid[]>([]);
  const [lotoFootGrids, setLotoFootGrids] = useState<LotoFootGrid[]>([]);
  const [euromillionsOptions, setEuromillionsOptions] = useState<EuromillionsOptions>({
    gridCount: 1,
    luckyNumbers: false,
    system: 'none'
  });
  
  const generateGrids = useGenerateGrids();
  const { user } = useAuth();
  
  // Récupérer le nom du joueur depuis les métadonnées utilisateur
  const playerName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Joueur';

  const getGridCost = () => {
    switch (group.game_type) {
      case 'euromillions':
        return 2.5;
      case 'lotto':
        return 2.2;
      case 'lotto_foot_15':
        return 1.0;
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
      {/* Affichage simplifié avec infos du joueur */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Bonjour {playerName} !</h3>
            <p className="text-sm text-muted-foreground">
              Budget disponible: <span className="font-medium text-primary">{budget}€</span> • 
              Maximum {maxGrids} {gridsLabel}
            </p>
          </div>
          <GameInfoCard gameType={group.game_type} />
        </div>
      </div>

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
          groupId={group.id}
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
