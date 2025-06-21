
import React from 'react';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LotoFootGridPreviewProps {
  predictions: number[][];
}

export const LotoFootGridPreview = ({ predictions }: LotoFootGridPreviewProps) => {
  const hasAnyPredictions = predictions.some(match => match.length > 0);

  if (!hasAnyPredictions) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        Aperçu du bulletin :
      </h5>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {Array.from({ length: 15 }).map((_, i) => {
          const selections = predictions[i] || [];
          const displaySelections = selections.map(val => val === 2 ? 'N' : val.toString()).join('');
          return (
            <div key={i} className="flex justify-between items-center p-1 bg-white rounded">
              <span className="font-medium">M{i + 1}:</span>
              <span className={cn(
                "font-bold",
                selections.length === 0 ? "text-gray-400" : 
                selections.length === 1 ? "text-green-600" :
                selections.length === 2 ? "text-orange-600" : "text-red-600"
              )}>
                {displaySelections || '--'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
