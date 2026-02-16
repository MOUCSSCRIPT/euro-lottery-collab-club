import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MatchSlideProps {
  matchNumber: number;
  totalMatches: number;
  homeTeam: string;
  awayTeam: string;
  selected: string[];
  onToggle: (value: '1' | 'X' | '2') => void;
}

export const MatchSlide = ({
  matchNumber,
  totalMatches,
  homeTeam,
  awayTeam,
  selected,
  onToggle,
}: MatchSlideProps) => {
  return (
    <Card className="border-2">
      <CardContent className="p-6 text-center space-y-6">
        {/* Match number indicator */}
        <div className="text-sm text-muted-foreground">
          Match {matchNumber} / {totalMatches}
        </div>
        
        {/* Teams */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{homeTeam}</h2>
          <span className="text-muted-foreground text-lg">vs</span>
          <h2 className="text-2xl font-bold">{awayTeam}</h2>
        </div>
        
        {/* Prediction buttons */}
        <div className="flex justify-center gap-4 py-4">
          {(['1', 'X', '2'] as const).map((value) => {
            const isSelected = selected.includes(value);
            return (
              <Button
                key={value}
                variant={isSelected ? "default" : "outline"}
                size="lg"
                onClick={() => onToggle(value)}
                className={cn(
                  "w-20 h-20 text-2xl font-bold transition-all duration-200",
                  isSelected && value === '1' && "bg-prediction-1 text-prediction-1-foreground hover:bg-prediction-1/90 border-prediction-1",
                  isSelected && value === 'X' && "bg-prediction-x text-prediction-x-foreground hover:bg-prediction-x/90 border-prediction-x",
                  isSelected && value === '2' && "bg-prediction-2 text-prediction-2-foreground hover:bg-prediction-2/90 border-prediction-2",
                )}
              >
                {value}
              </Button>
            );
          })}
        </div>
        
        {/* Helper text */}
        <p className="text-sm text-muted-foreground">
          {selected.length === 0 
            ? "Sélectionnez au moins un résultat"
            : selected.length === 1 
              ? "1 choix sélectionné"
              : `${selected.length} choix sélectionnés (double/triple)`
          }
        </p>
      </CardContent>
    </Card>
  );
};
