
import React from 'react';

interface ValidationMessagesProps {
  maxGrids: number;
  gridCost: number;
  playerName: string;
  gridMode: 'auto' | 'manual';
  completeGridsCount: number;
  gridLabel: string;
  hasInsufficientCoins?: boolean;
  requiredCoins?: number;
  currentCoins?: number;
}

export const ValidationMessages = ({
  maxGrids,
  gridCost,
  playerName,
  gridMode,
  completeGridsCount,
  gridLabel,
  hasInsufficientCoins = false,
  requiredCoins = 0,
  currentCoins = 0
}: ValidationMessagesProps) => {
  return (
    <>
      {/* Messages d'erreur */}
      {maxGrids === 0 && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Budget insuffisant. Minimum requis : 2,5 SuerteCoins
        </div>
      )}

      {hasInsufficientCoins && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          SuerteCoins insuffisants. Vous avez {currentCoins.toFixed(1)} SuerteCoins mais il vous faut {requiredCoins.toFixed(1)} SuerteCoins.
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
