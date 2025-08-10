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

  const itemClasses = 'flex flex-col items-center justify-center gap-0.5 h-10 w-12 text-xs font-semibold';

  return (
    <div className={cn('flex items-center justify-between bg-background px-4 py-3 rounded-lg border border-border')}>
      <div className="flex items-center gap-3 min-w-0">
        <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0.5">M{match.match_position}</Badge>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {match.home_team} <span className="text-muted-foreground">vs</span> {match.away_team}
          </div>
          <div className="text-xs text-muted-foreground">{time}</div>
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
          className={itemClasses}
        >
          <span>1</span>
          <span className="text-[10px] text-muted-foreground">{match.home_odds.toFixed(2)}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="X"
          aria-label={`Pronostic X pour M${match.match_position}`}
          disabled={disabled}
          className={itemClasses}
        >
          <span>X</span>
          <span className="text-[10px] text-muted-foreground">{match.draw_odds.toFixed(2)}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="2"
          aria-label={`Pronostic 2 pour M${match.match_position}`}
          disabled={disabled}
          className={itemClasses}
        >
          <span>2</span>
          <span className="text-[10px] text-muted-foreground">{match.away_odds.toFixed(2)}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default LotoFootMatchRow;
