
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { LotoFootMatchRow } from './LotoFootMatchRow';
import { LotoFootGridSummary } from './LotoFootGridSummary';
import { LotoFootGridPreview } from './LotoFootGridPreview';
import { LotoFootInstructions } from './LotoFootInstructions';
// LotoFoot functionality temporarily disabled

interface LotoFootGrid {
  id: string;
  predictions: number[][];
  cost: number;
  code: string;
}

interface LotoFootGridCardProps {
  grid: LotoFootGrid;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onTogglePrediction: (matchIndex: number, prediction: number) => void;
  isComplete: boolean;
  isValid: boolean;
  validationMessage: string;
  doubles: number;
  triples: number;
  multiplier: number;
  groupId: string;
}

const matchLabels = [
  "Match 1", "Match 2", "Match 3", "Match 4", "Match 5",
  "Match 6", "Match 7", "Match 8", "Match 9", "Match 10",
  "Match 11", "Match 12", "Match 13", "Match 14", "Match 15"
];

export const LotoFootGridCard = ({
  grid,
  index,
  canRemove,
  onRemove,
  onTogglePrediction,
  isComplete,
  isValid,
  validationMessage,
  doubles,
  triples,
  multiplier,
  groupId
}: LotoFootGridCardProps) => {
  const matches: any[] = [];
  
  // Créer les labels de matchs en utilisant les vrais noms ou les noms par défaut
  const getMatchLabel = (position: number) => {
    const match = matches.find(m => m.match_position === position);
    if (match) {
      return `${match.team_home} vs ${match.team_away}`;
    }
    return `Match ${position}`;
  };
  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-orange-100 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            Bulletin {index + 1}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <LotoFootGridSummary
          cost={grid.cost}
          doubles={doubles}
          triples={triples}
          multiplier={multiplier}
          isComplete={isComplete}
          isValid={isValid}
          validationMessage={validationMessage}
        />

        <LotoFootInstructions />

        {/* Grille des pronostics */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-2 text-left">Match</th>
                <th className="border border-gray-200 p-2 text-center w-16">1</th>
                <th className="border border-gray-200 p-2 text-center w-16">N</th>
                <th className="border border-gray-200 p-2 text-center w-16">2</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }, (_, matchIndex) => (
                <LotoFootMatchRow
                  key={matchIndex}
                  matchIndex={matchIndex}
                  matchLabel={getMatchLabel(matchIndex + 1)}
                  predictions={grid.predictions[matchIndex] || []}
                  onTogglePrediction={(prediction) => onTogglePrediction(matchIndex, prediction)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <LotoFootGridPreview predictions={grid.predictions} />
      </CardContent>
    </Card>
  );
};
