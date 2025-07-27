import React from 'react';
import { LotoFootMatch, PredictionType } from '@/types/loto-foot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LotoFootMatchCardProps {
  match: LotoFootMatch;
  selectedPredictions: PredictionType[];
  onPredictionToggle: (prediction: PredictionType) => void;
  disabled?: boolean;
}

export const LotoFootMatchCard = ({
  match,
  selectedPredictions,
  onPredictionToggle,
  disabled = false
}: LotoFootMatchCardProps) => {
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPredictionButton = (type: PredictionType, odds: number) => {
    const isSelected = selectedPredictions.includes(type);
    
    return (
      <Button
        key={type}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={cn(
          "flex-1 flex flex-col gap-1 h-12 text-xs font-bold transition-all",
          isSelected && "bg-primary text-primary-foreground",
          !isSelected && "hover:bg-muted",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => onPredictionToggle(type)}
        disabled={disabled}
      >
        <span className="text-lg font-bold">{type}</span>
        <span className="text-xs opacity-75">{odds.toFixed(2)}</span>
      </Button>
    );
  };

  return (
    <Card className="p-3 bg-background border border-border">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          Match {match.match_position}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatTime(match.match_datetime)}
        </span>
      </div>
      
      <div className="text-center mb-3">
        <div className="text-sm font-medium leading-tight">
          <div>{match.home_team}</div>
          <div className="text-xs text-muted-foreground my-1">vs</div>
          <div>{match.away_team}</div>
        </div>
      </div>

      <div className="flex gap-1">
        {getPredictionButton('1', match.home_odds)}
        {getPredictionButton('X', match.draw_odds)}
        {getPredictionButton('2', match.away_odds)}
      </div>

      {match.result && (
        <div className="mt-2 text-center">
          <Badge 
            variant={selectedPredictions.includes(match.result) ? "default" : "destructive"}
            className="text-xs"
          >
            Résultat: {match.result}
          </Badge>
        </div>
      )}
    </Card>
  );
};