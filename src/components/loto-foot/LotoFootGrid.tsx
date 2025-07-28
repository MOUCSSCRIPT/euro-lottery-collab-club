import React, { useState, useMemo } from 'react';
import { LotoFootMatch, LotoFootPrediction, PredictionType } from '@/types/loto-foot';
import { LotoFootMatchCard } from './LotoFootMatchCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateGridCosts, isValidGrid, MIN_PREDICTIONS } from '@/utils/lotoFootCosts';

interface LotoFootGridProps {
  matches: LotoFootMatch[];
  onPredictionsChange: (predictions: LotoFootPrediction[]) => void;
  disabled?: boolean;
}

export const LotoFootGrid = ({
  matches,
  onPredictionsChange,
  disabled = false
}: LotoFootGridProps) => {
  const [predictions, setPredictions] = useState<LotoFootPrediction[]>([]);

  const handlePredictionToggle = (matchPosition: number, prediction: PredictionType) => {
    setPredictions(prev => {
      const existing = prev.find(p => p.match_position === matchPosition);
      let newPredictions: LotoFootPrediction[];

      if (existing) {
        // Toggle prediction
        const updatedPredictions = existing.predictions.includes(prediction)
          ? existing.predictions.filter(p => p !== prediction)
          : [...existing.predictions, prediction];

        if (updatedPredictions.length === 0) {
          // Remove if no predictions left
          newPredictions = prev.filter(p => p.match_position !== matchPosition);
        } else {
          // Update existing
          newPredictions = prev.map(p =>
            p.match_position === matchPosition
              ? { ...p, predictions: updatedPredictions }
              : p
          );
        }
      } else {
        // Add new prediction
        newPredictions = [...prev, {
          match_position: matchPosition,
          predictions: [prediction]
        }];
      }

      onPredictionsChange(newPredictions);
      return newPredictions;
    });
  };

  const getPredictionsForMatch = (matchPosition: number): PredictionType[] => {
    const prediction = predictions.find(p => p.match_position === matchPosition);
    return prediction?.predictions || [];
  };

  const validPredictionsCount = predictions.filter(p => p.predictions.length > 0).length;
  const gridCalculation = useMemo(() => calculateGridCosts(predictions), [predictions]);
  const isGridValid = isValidGrid(predictions);

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Loto Foot - 15 Matchs</CardTitle>
            <Badge 
              variant={isGridValid ? "default" : "secondary"}
              className="text-sm"
            >
              {validPredictionsCount}/{matches.length} matchs
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Minimum {MIN_PREDICTIONS} pronostics requis
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(validPredictionsCount / matches.length) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Matches Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {matches
          .sort((a, b) => a.match_position - b.match_position)
          .map(match => (
            <LotoFootMatchCard
              key={match.id}
              match={match}
              selectedPredictions={getPredictionsForMatch(match.match_position)}
              onPredictionToggle={(prediction) => 
                handlePredictionToggle(match.match_position, prediction)
              }
              disabled={disabled}
            />
          ))}
      </div>

    </div>
  );
};