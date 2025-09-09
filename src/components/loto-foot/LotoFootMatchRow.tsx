import React from 'react';
import { LotoFootMatch, PredictionType } from '@/types/loto-foot';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface LotoFootMatchRowProps {
  match: LotoFootMatch;
  selectedPredictions: PredictionType[];
  onPredictionToggle: (prediction: PredictionType) => void;
  disabled?: boolean;
}

export const LotoFootMatchRow: React.FC<LotoFootMatchRowProps> = ({
  match,
  selectedPredictions,
  onPredictionToggle,
  disabled = false,
}) => {
  const handleGroupChange = (values: string[]) => {
    const prev = selectedPredictions;
    let changed: PredictionType | null = null;

    if (values.length > prev.length) {
      changed = values.find((v) => !prev.includes(v as PredictionType)) as PredictionType;
    } else if (values.length < prev.length) {
      changed = prev.find((v) => !(values as string[]).includes(v)) as PredictionType;
    }

    if (changed) onPredictionToggle(changed);
  };

  const time = new Date(match.match_datetime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemClasses = (prediction: PredictionType, isSelected: boolean) => {
    const baseClasses = 'flex flex-col items-center justify-center gap-0.5 h-10 w-12 text-xs font-semibold transition-all duration-200';
    
    if (isSelected) {
      return prediction === '1' 
        ? `${baseClasses} bg-prediction-1 text-prediction-1-foreground data-[state=on]:bg-prediction-1 data-[state=on]:text-prediction-1-foreground hover:bg-prediction-1/90`
        : prediction === 'X' 
        ? `${baseClasses} bg-prediction-x text-prediction-x-foreground data-[state=on]:bg-prediction-x data-[state=on]:text-prediction-x-foreground hover:bg-prediction-x/90`
        : `${baseClasses} bg-prediction-2 text-prediction-2-foreground data-[state=on]:bg-prediction-2 data-[state=on]:text-prediction-2-foreground hover:bg-prediction-2/90`;
    }
    
    return baseClasses;
  };

  return (
    <div className={cn('flex items-center justify-between bg-background px-4 py-3 rounded-lg border border-border')}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {match.home_team} <span className="text-muted-foreground">vs</span> {match.away_team}
          </div>
        </div>
      </div>
      <ToggleGroup
        type="multiple"
        value={selectedPredictions}
        onValueChange={handleGroupChange}
        className="shrink-0"
      >
        <ToggleGroupItem
          value="1"
          aria-label={`Pronostic 1 pour M${match.match_position}`}
          disabled={disabled}
          className={itemClasses('1', selectedPredictions.includes('1'))}
        >
          <span>1</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="X"
          aria-label={`Pronostic X pour M${match.match_position}`}
          disabled={disabled}
          className={itemClasses('X', selectedPredictions.includes('X'))}
        >
          <span>X</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="2"
          aria-label={`Pronostic 2 pour M${match.match_position}`}
          disabled={disabled}
          className={itemClasses('2', selectedPredictions.includes('2'))}
        >
          <span>2</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default LotoFootMatchRow;
