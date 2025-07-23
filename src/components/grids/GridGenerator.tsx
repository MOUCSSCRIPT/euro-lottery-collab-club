
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
    // Seulement Euromillions maintenant
    return 2.5;
  };

  const gridCost = getGridCost();
  const maxGrids = Math.floor(budget / gridCost);
  const totalCost = maxGrids * gridCost;
  const costPerMember = totalCost / memberCount;

  const handleGenerate = () => {
    if (gridMode === 'manual') {
      // Pour l'Euromillions en mode manuel
      generateGrids.mutate({
        groupId: group.id,
        budget,
        memberCount,
        gameType: 'euromillions',
        playerName,
        manualGrids: manualGrids.filter(grid => 
          grid.mainNumbers.length === 5 && grid.stars.length === 2
        )
      });
    } else {
      // Génération automatique
      generateGrids.mutate({
        groupId: group.id,
        budget,
        memberCount,
        gameType: 'euromillions',
        playerName,
        euromillionsOptions: euromillionsOptions
      });
    }
  };

  const gridLabel = 'grille';
  const gridsLabel = 'grilles';

  const canGenerate = () => {
    if (maxGrids === 0) return false;
    
    if (gridMode === 'manual') {
      const completeGrids = manualGrids.filter(grid => 
        grid.mainNumbers.length === 5 && grid.stars.length === 2
      );
      return completeGrids.length > 0;
    }
    
    return true;
  };

  const getCompleteGridsCount = () => {
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

      {/* Mode de génération pour Euromillions */}
      <GridModeSelector mode={gridMode} onModeChange={setGridMode} />

      {/* Options Euromillions (mode automatique seulement) */}
      {gridMode === 'auto' && (
        <EuromillionsOptionsComponent 
          options={euromillionsOptions}
          onOptionsChange={setEuromillionsOptions}
        />
      )}

      {/* Saisie manuelle Euromillions */}
      {gridMode === 'manual' && maxGrids > 0 && (
        <EuromillionsManualEntry 
          onGridsChange={setManualGrids}
          maxGrids={maxGrids}
        />
      )}

      {/* Seulement Euromillions maintenant */}

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
