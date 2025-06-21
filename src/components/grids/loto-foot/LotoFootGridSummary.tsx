
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface LotoFootGridSummaryProps {
  cost: number;
  doubles: number;
  triples: number;
  multiplier: number;
  isComplete: boolean;
  isValid: boolean;
  validationMessage: string;
}

export const LotoFootGridSummary = ({
  cost,
  doubles,
  triples,
  multiplier,
  isComplete,
  isValid,
  validationMessage
}: LotoFootGridSummaryProps) => {
  return (
    <div className="space-y-4">
      {/* Validation Error */}
      {!isValid && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{validationMessage}</span>
        </div>
      )}

      {/* Cost Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-blue-600">Coût</div>
          <div className="text-lg font-bold text-blue-800">{cost.toFixed(2)}€</div>
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
          <div className="text-lg font-bold text-blue-800">{multiplier}x</div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        {isComplete && isValid ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Valide
          </Badge>
        ) : !isValid ? (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Erreur
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            En cours
          </Badge>
        )}
      </div>
    </div>
  );
};
