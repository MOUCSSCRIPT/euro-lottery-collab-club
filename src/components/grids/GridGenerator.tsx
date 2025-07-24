
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGenerateGrids } from '@/hooks/useGrids';
import { Tables } from '@/integrations/supabase/types';
import { EuromillionsManualEntry } from './EuromillionsManualEntry';
import { GameInfoCard } from './generator/GameInfoCard';
import { GenerateButton } from './generator/GenerateButton';
import { ValidationMessages } from './generator/ValidationMessages';
import { useAuth } from '@/contexts/AuthContext';

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
  const [budget] = useState(50); // Budget fixe limité à 50€
  const [manualGrids, setManualGrids] = useState<ManualGrid[]>([]);
  
  const generateGrids = useGenerateGrids();
  const { user } = useAuth();
  
  // Le générateur est toujours accessible aux membres du groupe
  const isGroupPublic = true; // Tous les membres peuvent générer des grilles
  
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
    // Seulement mode manuel maintenant
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
  };

  const gridLabel = 'grille';
  const gridsLabel = 'grilles';

  const canGenerate = () => {
    if (budget < 2.5) return false; // Budget minimum 2,5€
    if (maxGrids === 0) return false;
    
    const completeGrids = manualGrids.filter(grid => 
      grid.mainNumbers.length === 5 && grid.stars.length === 2
    );
    return completeGrids.length > 0;
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
      
      {/* Interface simplifiée - seulement saisie manuelle */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Saisie manuelle uniquement */}
      {maxGrids > 0 && (
        <EuromillionsManualEntry 
          onGridsChange={setManualGrids}
          maxGrids={maxGrids}
        />
      )}

      <GenerateButton
        canGenerate={canGenerate()}
        isGenerating={generateGrids.isPending}
        gridMode="manual"
        completeGridsCount={getCompleteGridsCount()}
        maxGrids={maxGrids}
        gridsLabel={gridsLabel}
        onGenerate={handleGenerate}
      />

      <ValidationMessages
        maxGrids={maxGrids}
        gridCost={gridCost}
        playerName={playerName}
        gridMode="manual"
        completeGridsCount={getCompleteGridsCount()}
        gridLabel={gridLabel}
      />
    </div>
  );
};
