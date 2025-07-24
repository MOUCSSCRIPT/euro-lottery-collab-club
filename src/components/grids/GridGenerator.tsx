
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGenerateGrids } from '@/hooks/useGrids';
import { Tables } from '@/integrations/supabase/types';
import { EuromillionsManualEntry } from './EuromillionsManualEntry';
import { EuromillionsOptionsComponent } from './EuromillionsOptions';
import { GridModeSelector } from './GridModeSelector';

import { GenerateButton } from './generator/GenerateButton';
import { ValidationMessages } from './generator/ValidationMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { EuromillionsOptions } from '@/types/euromillions';

interface GridGeneratorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

interface ManualGrid {
  id: string;
  mainNumbers: number[];
  stars: number[];
}

export const GridGenerator = ({ group, memberCount }: GridGeneratorProps) => {
  const [budget, setBudget] = useState(2.5); // Budget minimum de 2,5€ pour 1 grille
  const [manualGrids, setManualGrids] = useState<ManualGrid[]>([]);
  const [gridMode, setGridMode] = useState<'auto' | 'manual'>('manual');
  const [euromillionsOptions, setEuromillionsOptions] = useState<EuromillionsOptions>({
    gridCount: 1,
    luckyNumbers: false,
    system: 'none'
  });
  
  const generateGrids = useGenerateGrids();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Le générateur est toujours accessible aux membres du groupe
  const isGroupPublic = true; // Tous les membres peuvent générer des grilles
  
  // Récupérer le nom du joueur depuis les métadonnées utilisateur
  const playerName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Joueur';

  const getGridCost = () => {
    let baseCost = 2.5; // Coût de base Euromillions
    
    if (gridMode === 'auto') {
      // En mode automatique, appliquer les options FDJ
      if (euromillionsOptions.luckyNumbers) baseCost += 1.0;
      if (euromillionsOptions.system && euromillionsOptions.system !== 'none') {
        const systemCosts = {
          'System 7': 7.0,
          'System 8': 28.0,
          'System 9': 84.0
        };
        baseCost += systemCosts[euromillionsOptions.system];
      }
    }
    
    return baseCost;
  };

  const gridCost = getGridCost();
  const maxGrids = gridMode === 'auto' ? euromillionsOptions.gridCount : Math.floor(budget / gridCost);
  const totalCost = gridMode === 'auto' ? (euromillionsOptions.gridCount * gridCost) : (maxGrids * gridCost);
  const costPerMember = totalCost / memberCount;

  // Calculs en temps réel pour les SuerteCoins
  const currentCoins = profile?.coins || 0;
  const requiredCoins = totalCost;
  const remainingCoins = currentCoins - requiredCoins;
  const hasInsufficientCoins = remainingCoins < 0;

  // Preview de déduction instantanée
  const coinDeductionPreview = useMemo(() => ({
    current: currentCoins,
    required: requiredCoins,
    remaining: Math.max(0, remainingCoins),
    insufficient: hasInsufficientCoins
  }), [currentCoins, requiredCoins, remainingCoins, hasInsufficientCoins]);

  const handleGenerate = () => {
    if (gridMode === 'auto') {
      // Mode automatique avec options FDJ
      generateGrids.mutate({
        groupId: group.id,
        budget: totalCost,
        memberCount,
        gameType: 'euromillions',
        playerName,
        euromillionsOptions
      });
    } else {
      // Mode manuel
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
    }
  };

  const gridLabel = 'grille';
  const gridsLabel = 'grilles';

  const canGenerate = () => {
    if (hasInsufficientCoins) return false; // Vérifier les SuerteCoins
    
    if (gridMode === 'auto') {
      return euromillionsOptions.gridCount > 0;
    } else {
      if (budget < 2.5) return false; // Budget minimum 2,5€
      if (maxGrids === 0) return false;
      
      const completeGrids = manualGrids.filter(grid => 
        grid.mainNumbers.length === 5 && grid.stars.length === 2
      );
      return completeGrids.length > 0;
    }
  };

  const getCompleteGridsCount = () => {
    return manualGrids.filter(grid => 
      grid.mainNumbers.length === 5 && grid.stars.length === 2
    ).length;
  };

  return (
    <div className="space-y-6">

      {/* Vérifier si le groupe est public */}
      {!isGroupPublic && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Ce groupe est privé. Seuls les membres autorisés peuvent générer des grilles.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Sélecteur de mode */}
      <GridModeSelector mode={gridMode} onModeChange={setGridMode} />
      

      {/* Options FDJ disponibles dans les deux modes */}
      <EuromillionsOptionsComponent 
        options={euromillionsOptions}
        onOptionsChange={setEuromillionsOptions}
      />

      {/* Saisie manuelle uniquement en mode manuel */}
      {gridMode === 'manual' && maxGrids > 0 && (
        <EuromillionsManualEntry 
          onGridsChange={setManualGrids}
          maxGrids={maxGrids}
        />
      )}

      <GenerateButton
        canGenerate={canGenerate()}
        isGenerating={generateGrids.isPending}
        gridMode={gridMode}
        completeGridsCount={getCompleteGridsCount()}
        maxGrids={gridMode === 'auto' ? euromillionsOptions.gridCount : maxGrids}
        gridsLabel={gridsLabel}
        onGenerate={handleGenerate}
      />

      <ValidationMessages
        maxGrids={gridMode === 'auto' ? euromillionsOptions.gridCount : maxGrids}
        gridCost={gridCost}
        playerName={playerName}
        gridMode={gridMode}
        completeGridsCount={getCompleteGridsCount()}
        gridLabel={gridLabel}
        hasInsufficientCoins={hasInsufficientCoins}
        requiredCoins={requiredCoins}
        currentCoins={currentCoins}
      />
    </div>
  );
};
