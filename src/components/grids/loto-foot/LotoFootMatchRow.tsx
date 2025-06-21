
import React from 'react';
import { cn } from '@/lib/utils';

interface LotoFootMatchRowProps {
  matchIndex: number;
  matchLabel: string;
  predictions: number[];
  onTogglePrediction: (prediction: number) => void;
}

const predictionOptions = [
  { value: 1, label: '1', description: 'Victoire équipe domicile' },
  { value: 2, label: 'N', description: 'Match nul' },
  { value: 3, label: '2', description: 'Victoire équipe extérieur' }
];

export const LotoFootMatchRow = ({ 
  matchIndex, 
  matchLabel, 
  predictions, 
  onTogglePrediction 
}: LotoFootMatchRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border border-gray-200 p-2 font-medium">
        {matchLabel}
      </td>
      {predictionOptions.map((option) => {
        const isSelected = predictions.includes(option.value);
        return (
          <td 
            key={option.value} 
            className={cn(
              "border border-gray-200 p-2 text-center cursor-pointer transition-colors",
              isSelected ? "bg-blue-100" : "hover:bg-gray-100"
            )}
            onClick={() => onTogglePrediction(option.value)}
          >
            <div className={cn(
              "w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-all",
              isSelected 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}>
              {option.label}
            </div>
          </td>
        );
      })}
    </tr>
  );
};
