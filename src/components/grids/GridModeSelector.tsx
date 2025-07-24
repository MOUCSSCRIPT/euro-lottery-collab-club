
import React from 'react';
import { Edit3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type GridMode = 'auto' | 'manual';

interface GridModeSelectorProps {
  mode: GridMode;
  onModeChange: (mode: GridMode) => void;
}

export const GridModeSelector = ({ mode, onModeChange }: GridModeSelectorProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-medium",
          mode === 'manual' 
            ? "border-blue-500 bg-blue-50 text-blue-700" 
            : "border-gray-200 hover:border-gray-300 text-gray-600"
        )}
        onClick={() => onModeChange('manual')}
      >
        <Edit3 className="h-4 w-4" />
        Manuel
      </button>
      
      <button
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
          mode === 'auto' 
            ? "border-gray-400 bg-gray-50 text-gray-700" 
            : "border-gray-200 hover:border-gray-300 text-gray-500"
        )}
        onClick={() => onModeChange('auto')}
      >
        <Zap className="h-3 w-3" />
        Auto
      </button>
    </div>
  );
};
