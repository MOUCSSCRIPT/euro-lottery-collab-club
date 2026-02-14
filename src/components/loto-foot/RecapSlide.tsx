import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_position: number;
}

interface RecapSlideProps {
  predictions: Record<string, string[]>;
  matches: Match[];
  combinations: number;
  cost: number;
  userCoins: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onGoToMatch: (index: number) => void;
}

export const RecapSlide = ({
  predictions,
  matches,
  combinations,
  cost,
  userCoins,
  isSubmitting,
  onConfirm,
  onGoToMatch,
}: RecapSlideProps) => {
  const predictionCount = Object.keys(predictions).length;
  const minPredictions = Math.max(12, matches.length - 3);
  const isValidPredictions = predictionCount >= minPredictions;
  const hasEnoughCoins = userCoins >= cost;
  const canSubmit = isValidPredictions && hasEnoughCoins && combinations > 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-center text-xl">Récapitulatif</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Matches summary */}
        <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
          {matches.map((match, index) => {
            const preds = predictions[match.id];
            const hasPrediction = preds && preds.length > 0;
            
            return (
              <button
                key={match.id}
                onClick={() => onGoToMatch(index)}
                className={cn(
                  "w-full flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 transition-colors text-left animate-fade-in-up opacity-0",
                  !hasPrediction && "text-muted-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <span className="text-sm flex items-center gap-2">
                  {hasPrediction ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span className="truncate">
                    {index + 1}. {match.home_team} vs {match.away_team}
                  </span>
                </span>
                <span className={cn(
                  "font-mono text-sm flex-shrink-0 ml-2",
                  hasPrediction ? "text-primary" : "text-destructive"
                )}>
                  {preds?.join(' / ') || '—'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Matchs pronostiqués</span>
            <span className={cn(
              "font-medium",
              isValidPredictions ? "text-primary" : "text-destructive"
            )}>
              {predictionCount}/{matches.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Combinaisons</span>
            <span className="font-bold">{combinations}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Votre solde</span>
            <SuerteCoinsDisplay amount={userCoins} size="sm" />
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total à payer</span>
            <SuerteCoinsDisplay amount={cost} size="sm" />
          </div>
        </div>

        {/* Validation messages */}
        {!isValidPredictions && (
          <Alert variant="destructive">
            <AlertDescription>
              Minimum {minPredictions} pronostics requis ({minPredictions - predictionCount} manquants)
            </AlertDescription>
          </Alert>
        )}
        
        {isValidPredictions && !hasEnoughCoins && (
          <Alert variant="destructive">
            <AlertDescription>
              Solde insuffisant. Il vous manque {cost - userCoins} SuerteCoins.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button 
          className="w-full" 
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={onConfirm}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validation...
            </>
          ) : (
            <>Payer {cost} SC et valider</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
