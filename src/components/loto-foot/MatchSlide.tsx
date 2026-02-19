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
    <Card className="border border-border bg-card">
      <CardContent className="p-6 text-center space-y-6">
        {/* Match number indicator */}
        <div className="text-sm text-muted-foreground">
          Match {matchNumber} / {totalMatches}
        </div>
        
        {/* Teams */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-prediction-1">{homeTeam}</h2>
          <span className="text-muted-foreground text-lg">vs</span>
          <h2 className="text-2xl font-bold text-accent">{awayTeam}</h2>
        </div>
        
        {/* Prediction buttons with geometric shapes */}
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
                  "w-20 h-20 text-2xl font-bold transition-all duration-200 relative",
                  isSelected && value === '1' && "bg-prediction-1 text-prediction-1-foreground hover:bg-prediction-1/90 border-prediction-1 neon-glow-teal",
                  isSelected && value === 'X' && "bg-prediction-x text-prediction-x-foreground hover:bg-prediction-x/90 border-prediction-x neon-glow",
                  isSelected && value === '2' && "bg-prediction-2 text-prediction-2-foreground hover:bg-prediction-2/90 border-prediction-2 neon-glow-accent",
                  !isSelected && "border-border hover:border-muted-foreground"
                )}
              >
                <span className="relative z-10">{value}</span>
                {/* Geometric shape indicator */}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-30">
                  {value === '1' && (
                    <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                  )}
                  {value === 'X' && (
                    <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,11 1,11" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                  )}
                  {value === '2' && (
                    <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                  )}
                </span>
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
