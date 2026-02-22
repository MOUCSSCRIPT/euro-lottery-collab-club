import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { useProfile } from '@/hooks/useProfile';
import { useNextPublishedGrid } from '@/hooks/useNextPublishedGrid';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { calculateCost, calculateCombinationsPreview, LOTO_FOOT_GRID_COST } from '@/utils/lotoFootCosts';
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export const LotoFootPlayGrid = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});

  const { data: publishedGrid, isLoading: publishedGridLoading } = useNextPublishedGrid();
  const nextDrawDate = publishedGrid?.draw_date || '';
  const { data: matches, isLoading: matchesLoading } = useLotoFootMatches(nextDrawDate);
  const { profile, isLoading: profileLoading } = useProfile();

  const isPublished = publishedGrid?.status === 'published';
  const isDeadlinePassed = publishedGrid?.play_deadline 
    ? new Date(publishedGrid.play_deadline) < new Date()
    : false;

  const minPredictions = matches ? Math.max(12, matches.length - 3) : 12;
  const { combinations, cost } = useMemo(() => {
    return calculateCost(predictions, minPredictions);
  }, [predictions, minPredictions]);

  const combinationsPreview = useMemo(() => {
    return calculateCombinationsPreview(predictions);
  }, [predictions]);

  const predictionCount = Object.keys(predictions).length;
  const isValidPredictions = predictionCount >= minPredictions;
  const hasEnoughCoins = (profile?.coins || 0) >= cost;
  const canSubmit = isValidPredictions && hasEnoughCoins && combinations > 0;

  const togglePrediction = (matchId: string, value: '1' | 'X' | '2') => {
    setPredictions(prev => {
      const current = prev[matchId] || [];
      if (current.includes(value)) {
        const filtered = current.filter(v => v !== value);
        if (filtered.length === 0) {
          const { [matchId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [matchId]: filtered };
      } else {
        return { ...prev, [matchId]: [...current, value] };
      }
    });
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user || !matches || !profile) throw new Error('Missing data');
      if (profile.coins < cost) throw new Error('SuerteCoins insuffisants');

      const { data, error } = await supabase.functions.invoke('submit-loto-foot-grid', {
        body: { predictions, draw_date: nextDrawDate },
      });

      if (error) throw error;
      if (data?.code === 'INSUFFICIENT_COINS') {
        throw new Error(data.error || 'SuerteCoins insuffisants.');
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Erreur inconnue');
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-loto-foot-grids'] });
      toast({
        title: 'Grille validée !',
        description: `${data.grids_created} grille${data.grids_created > 1 ? 's' : ''} enregistrée${data.grids_created > 1 ? 's' : ''} (${data.cost} SC)`,
      });
      setPredictions({});
    },
    onError: (error) => {
      console.error('Error submitting grid:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de valider la grille',
        variant: 'destructive',
      });
    },
  });

  if (matchesLoading || publishedGridLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPublished) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Aucune grille disponible pour le moment. Revenez plus tard !</AlertDescription>
      </Alert>
    );
  }

  if (isDeadlinePassed) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>La participation pour ce tirage est clôturée.</AlertDescription>
      </Alert>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>La grille est en cours de préparation. Les matchs seront bientôt disponibles.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Deadline countdown */}
      {publishedGrid?.play_deadline && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <DeadlineCountdown deadline={publishedGrid.play_deadline} variant="default" />
        </div>
      )}

      {/* Grid table */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{publishedGrid?.name || 'Loto Foot 15'}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {predictionCount}/{matches.length} matchs
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-3 sm:px-6">
          {/* Header */}
          <div className="grid grid-cols-[1.5rem_1fr_repeat(3,2.5rem)_1fr] sm:grid-cols-[2rem_1fr_repeat(3,4rem)_1fr] gap-1 text-xs font-semibold text-muted-foreground pb-2 border-b">
            <span>#</span>
            <span>Domicile</span>
            <span className="text-center">1</span>
            <span className="text-center">N</span>
            <span className="text-center">2</span>
            <span>Extérieur</span>
          </div>

          {matches.map((match) => {
            const preds = predictions[match.id] || [];
            return (
              <div key={match.id} className="grid grid-cols-[1.5rem_1fr_repeat(3,2.5rem)_1fr] sm:grid-cols-[2rem_1fr_repeat(3,4rem)_1fr] gap-1 items-center py-2 border-b last:border-0">
                <span className="text-xs font-mono text-muted-foreground">{match.match_position}</span>
                <span className="text-sm truncate font-medium">{match.home_team}</span>

                {(['1', 'X', '2'] as const).map((val) => {
                  const displayVal = val === 'X' ? 'N' : val;
                  const isSelected = preds.includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => togglePrediction(match.id, val)}
                      className={cn(
                        "w-full aspect-square rounded font-bold text-xs sm:text-sm transition-all duration-150 border touch-manipulation flex items-center justify-center",
                        isSelected && val === '1' && "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 scale-105",
                        isSelected && val === 'X' && "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40 scale-105",
                        isSelected && val === '2' && "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40 scale-105",
                        !isSelected && "bg-transparent text-muted-foreground/40 border-transparent hover:bg-muted/50 hover:text-foreground/60 active:bg-muted"
                      )}
                    >
                      {displayVal}
                    </button>
                  );
                })}

                <span className="text-sm truncate font-medium">{match.away_team}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary & submit */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Matchs pronostiqués</span>
            <span className={cn("font-medium", isValidPredictions ? "text-primary" : "text-destructive")}>
              {predictionCount}/{matches.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Combinaisons</span>
            <span className="font-bold">{combinationsPreview || 1}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Votre solde</span>
            <SuerteCoinsDisplay amount={profile?.coins || 0} size="sm" />
          </div>
          <div className="flex justify-between text-base font-bold border-t pt-2">
            <span>Total</span>
            <SuerteCoinsDisplay amount={combinationsPreview * LOTO_FOOT_GRID_COST || LOTO_FOOT_GRID_COST} size="sm" />
          </div>

          {!isValidPredictions && predictionCount > 0 && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Minimum {minPredictions} pronostics requis ({minPredictions - predictionCount} manquants)
              </AlertDescription>
            </Alert>
          )}

          {isValidPredictions && !hasEnoughCoins && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Solde insuffisant. Il vous manque {cost - (profile?.coins || 0)} SuerteCoins.
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!canSubmit || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? (
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
    </div>
  );
};
