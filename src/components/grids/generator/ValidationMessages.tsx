
import React from 'react';

interface ValidationMessagesProps {
  maxGrids: number;
  gridCost: number;
  playerName: string;
  gridMode: 'auto' | 'manual';
  completeGridsCount: number;
  gridLabel: string;
}

export const ValidationMessages = ({
  maxGrids,
  gridCost,
  playerName,
  gridMode,
  completeGridsCount,
  gridLabel
}: ValidationMessagesProps) => {
  return (
    <>
      {/* Messages d'erreur */}
      {maxGrids === 0 && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Budget insuffisant. Minimum requis : {gridCost}€
        </div>
      )}

      {!playerName.trim() && (
        <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
          Veuillez saisir votre nom pour continuer
        </div>
      )}

      {gridMode === 'manual' && completeGridsCount === 0 && maxGrids > 0 && (
        <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          Complétez au moins une {gridLabel} pour continuer
        </div>
      )}
    </>
  );
};
