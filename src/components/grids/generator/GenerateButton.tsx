
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';

interface GenerateButtonProps {
  canGenerate: boolean;
  isGenerating: boolean;
  gridMode: 'auto' | 'manual';
  completeGridsCount: number;
  maxGrids: number;
  gridsLabel: string;
  onGenerate: () => void;
}

export const GenerateButton = ({
  canGenerate,
  isGenerating,
  gridMode,
  completeGridsCount,
  maxGrids,
  gridsLabel,
  onGenerate
}: GenerateButtonProps) => {
  const getButtonText = () => {
    if (isGenerating) {
      return (
        <>
          <Dices className="mr-2 h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      );
    }

    if (gridMode === 'manual') {
      return (
        <>
          <Dices className="mr-2 h-4 w-4" />
          Valider {completeGridsCount} {completeGridsCount > 1 ? gridsLabel : gridLabel}
        </>
      );
    }

    return (
      <>
        <Dices className="mr-2 h-4 w-4" />
        Générer {maxGrids} {maxGrids > 1 ? gridsLabel : gridLabel}
      </>
    );
  };

  const gridLabel = gridsLabel.slice(0, -1); // Remove 's' for singular

  return (
    <Button 
      onClick={onGenerate}
      disabled={!canGenerate || isGenerating}
      className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
      size="lg"
    >
      {getButtonText()}
    </Button>
  );
};
