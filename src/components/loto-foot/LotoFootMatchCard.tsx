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
    
    const getVariantClasses = () => {
      if (isSelected) {
        return type === '1' 
          ? "bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg animate-bounce-in" 
          : type === 'X' 
          ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg animate-bounce-in"
          : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg animate-bounce-in";
      }
      return "hover:bg-muted/70 hover:scale-105 transition-all duration-200";
    };
    
    return (
      <Button
        key={type}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={cn(
          "flex-1 flex flex-col gap-0.5 h-8 text-xs font-bold transition-all duration-200",
          getVariantClasses(),
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => onPredictionToggle(type)}
        disabled={disabled}
      >
        <span className="text-sm font-bold">{type}</span>
        <span className="text-[10px] opacity-75">{odds.toFixed(2)}</span>
      </Button>
    );
  };

  return (
    <Card className="p-2 bg-background border border-border hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          M{match.match_position}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {formatTime(match.match_datetime)}
        </span>
      </div>
      
      <div className="text-center mb-2">
        <div className="text-xs font-medium leading-tight">
          <div className="truncate">{match.home_team}</div>
          <div className="text-[10px] text-muted-foreground my-0.5">vs</div>
          <div className="truncate">{match.away_team}</div>
        </div>
      </div>

      <div className="flex gap-1">
        {getPredictionButton('1', match.home_odds)}
        {getPredictionButton('X', match.draw_odds)}
        {getPredictionButton('2', match.away_odds)}
      </div>

      {match.result && (
        <div className="mt-1.5 text-center">
          <Badge 
            variant={selectedPredictions.includes(match.result) ? "default" : "destructive"}
            className="text-[10px] px-1.5 py-0.5"
          >
            {match.result}
          </Badge>
        </div>
      )}
    </Card>
  );
};