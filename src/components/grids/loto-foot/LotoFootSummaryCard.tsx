
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LotoFootSummaryCardProps {
  validGridsCount: number;
  totalGridsCount: number;
  totalCost: number;
  allGridsValid: boolean;
}

export const LotoFootSummaryCard = ({
  validGridsCount,
  totalGridsCount,
  totalCost,
  allGridsValid
}: LotoFootSummaryCardProps) => {
  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-orange-800">
                <strong>{validGridsCount}</strong> 
                {' '}bulletin(s) valide(s) sur <strong>{totalGridsCount}</strong>
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Coût total : <strong>{totalCost.toFixed(2)}€</strong>
              </p>
            </div>
            {allGridsValid && (
              <Badge className="bg-green-600">
                Prêt à jouer !
              </Badge>
            )}
          </div>
          
          {!allGridsValid && (
            <div className="text-xs text-orange-600">
              Complétez et corrigez tous les bulletins pour continuer
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
