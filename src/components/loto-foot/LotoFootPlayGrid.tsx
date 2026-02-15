import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { useProfile } from '@/hooks/useProfile';
import { useNextPublishedGrid } from '@/hooks/useNextPublishedGrid';
import { ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { calculateCost, calculateCombinationsPreview, LOTO_FOOT_GRID_COST } from '@/utils/lotoFootCosts';
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { MatchSlide } from './MatchSlide';
import { RecapSlide } from './RecapSlide';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export const LotoFootPlayGrid = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});

  const { data: publishedGrid, isLoading: publishedGridLoading } = useNextPublishedGrid();
  const nextDrawDate = publishedGrid?.draw_date || '';
  const { data: matches, isLoading: matchesLoading } = useLotoFootMatches(nextDrawDate);
  const { profile, isLoading: profileLoading } = useProfile();

  // Check grid status
  const isPublished = publishedGrid?.status === 'published';
  const isDeadlinePassed = publishedGrid?.play_deadline 
    ? new Date(publishedGrid.play_deadline) < new Date()
    : false;

  const totalSlides = matches ? matches.length + 1 : 0; // +1 for recap slide
  const isOnRecapSlide = currentSlide === matches?.length;

  // Dynamic cost calculation
  const minPredictions = matches ? Math.max(12, matches.length - 3) : 12;
  const { combinations, cost } = useMemo(() => {
    return calculateCost(predictions, minPredictions);
  }, [predictions, minPredictions]);

  const combinationsPreview = useMemo(() => {
    return calculateCombinationsPreview(predictions);
  }, [predictions]);

  // Toggle prediction for a match
  const togglePrediction = (matchId: string, value: '1' | 'N' | '2') => {
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

  // Navigation
  const goToSlide = (index: number) => setCurrentSlide(index);
  const goNext = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const goPrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user || !matches || !profile) throw new Error('Missing data');
      
      if (profile.coins < cost) throw new Error('SuerteCoins insuffisants');

      // Deduct coins directly via profile update
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - cost })
        .eq('user_id', user.id);
      
      if (coinsError) throw coinsError;

      // Format predictions for storage
      const formattedPredictions = matches.map((match) => ({
        match_position: match.match_position,
        predictions: predictions[match.id] || [],
      }));

      // Save grid
      const { error: gridError } = await supabase
        .from('user_loto_foot_grids')
        .insert({
          user_id: user.id,
          draw_date: nextDrawDate,
          predictions: formattedPredictions,
          cost: cost,
          stake: LOTO_FOOT_GRID_COST,
          potential_winnings: 0,
          status: 'pending',
        });

      if (gridError) throw gridError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-loto-foot-grids'] });
      toast({
        title: 'Grille validée !',
        description: `${combinations} combinaison${combinations > 1 ? 's' : ''} enregistrée${combinations > 1 ? 's' : ''}`,
      });
      // Reset state
      setPredictions({});
      setCurrentSlide(0);
    },
    onError: (error) => {
      console.error('Error submitting grid:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la grille',
        variant: 'destructive',
      });
    },
  });

  // Loading state
  if (matchesLoading || publishedGridLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No published grid
  if (!isPublished) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Aucune grille disponible pour le moment. Revenez plus tard !
        </AlertDescription>
      </Alert>
    );
  }

  // Deadline passed
  if (isDeadlinePassed) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          La participation pour ce tirage est clôturée.
        </AlertDescription>
      </Alert>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          La grille est en cours de préparation. Les matchs seront bientôt disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  const currentMatch = matches[currentSlide];

  return (
    <div className="space-y-4">
      {/* Deadline countdown */}
      {publishedGrid?.play_deadline && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <DeadlineCountdown 
            deadline={publishedGrid.play_deadline}
            variant="default"
          />
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-1 flex-wrap max-w-sm mx-auto">
        {matches.map((match, index) => {
          const hasPrediction = predictions[match.id]?.length > 0;
          const isCurrent = index === currentSlide;
          
          return (
            <button
              key={match.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200",
                isCurrent ? "bg-primary scale-125" : 
                hasPrediction ? "bg-primary/60" : "bg-muted-foreground/30"
              )}
              aria-label={`Match ${index + 1}`}
            />
          );
        })}
        {/* Recap dot */}
        <button
          onClick={() => goToSlide(matches.length)}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-200 ml-2",
            isOnRecapSlide ? "bg-primary scale-125" : "bg-muted-foreground/30"
          )}
          aria-label="Récapitulatif"
        />
      </div>

      {/* Current slide */}
      {isOnRecapSlide ? (
        <RecapSlide
          predictions={predictions}
          matches={matches}
          combinations={combinations}
          cost={cost}
          userCoins={profile?.coins || 0}
          isSubmitting={submitMutation.isPending}
          onConfirm={() => submitMutation.mutate()}
          onGoToMatch={goToSlide}
        />
      ) : currentMatch ? (
        <MatchSlide
          matchNumber={currentSlide + 1}
          totalMatches={matches.length}
          homeTeam={currentMatch.home_team}
          awayTeam={currentMatch.away_team}
          selected={predictions[currentMatch.id] || []}
          onToggle={(value) => togglePrediction(currentMatch.id, value)}
        />
      ) : null}

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        <Button
          onClick={goNext}
          disabled={currentSlide === totalSlides - 1}
          className="flex-1"
        >
          {isOnRecapSlide ? 'Récap' : 'Suivant'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Live cost display */}
      {!isOnRecapSlide && (
        <div className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur border-t p-3 z-10">
          <div className="flex justify-between items-center max-w-md mx-auto px-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Matchs: </span>
              <span className="font-medium">{Object.keys(predictions).length}/{matches.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Combinaisons: </span>
              <span className="font-bold">{combinationsPreview || 1}</span>
            </div>
            <SuerteCoinsDisplay 
              amount={combinationsPreview * LOTO_FOOT_GRID_COST || LOTO_FOOT_GRID_COST} 
              size="sm" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
