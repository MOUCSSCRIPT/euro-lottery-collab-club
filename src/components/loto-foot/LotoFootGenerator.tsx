import React, { useState, useEffect } from 'react';
import { LotoFootGrid } from './LotoFootGrid';
import { LotoFootMatch, LotoFootPrediction } from '@/types/loto-foot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isValidGrid, calculateGridCosts } from '@/utils/lotoFootCosts';

import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

interface LotoFootGeneratorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

export const LotoFootGenerator = ({ group, memberCount }: LotoFootGeneratorProps) => {
  const [matches, setMatches] = useState<LotoFootMatch[]>([]);
  const [predictions, setPredictions] = useState<LotoFootPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Get next Friday for Loto Foot draw
  const getNextDrawDate = () => {
    const today = new Date();
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    if (daysUntilFriday === 0 && today.getHours() >= 20) {
      nextFriday.setDate(today.getDate() + 7);
    } else {
      nextFriday.setDate(today.getDate() + daysUntilFriday);
    }
    return nextFriday.toISOString().split('T')[0];
  };

  const drawDate = getNextDrawDate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      
      // Load existing matches for the draw date
      const { data: existingMatches, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('draw_date', drawDate)
        .order('match_position');

      if (error) throw error;

      setMatches((existingMatches as LotoFootMatch[]) || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matchs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleGenerateGrid = async () => {
    if (!isValidGrid(predictions)) {
      toast({
        title: "Grille invalide",
        description: "Veuillez sélectionner au moins 12 pronostics",
        variant: "destructive"
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Erreur",
        description: "Profil utilisateur non trouvé",
        variant: "destructive"
      });
      return;
    }

    const calculation = calculateGridCosts(predictions);

    // Check coin balance optimistically
    if (profile.coins < calculation.totalCost) {
      toast({
        title: "Coins insuffisants",
        description: `Vous avez ${profile.coins} coins, il en faut ${calculation.totalCost}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Optimistic update: immediately deduct coins from UI
      const optimisticProfile = { ...profile, coins: profile.coins - calculation.totalCost };
      queryClient.setQueryData(['profile', user.user.id], optimisticProfile);

      // Parallel requests for better performance
      const [existingGridsResult, gridNumbersResult] = await Promise.all([
        supabase
          .from('loto_foot_grids')
          .select('predictions')
          .eq('group_id', group.id)
          .eq('is_active', true),
        supabase
          .from('loto_foot_grids')
          .select('grid_number')
          .eq('group_id', group.id)
          .order('grid_number', { ascending: false })
          .limit(1)
      ]);

      // Check for duplicates
      const predictionsKey = JSON.stringify(predictions.sort((a, b) => a.match_position - b.match_position));
      const isDuplicate = existingGridsResult.data?.some(grid => {
        const gridKey = JSON.stringify((grid.predictions as any[]).sort((a, b) => a.match_position - b.match_position));
        return gridKey === predictionsKey;
      });

      if (isDuplicate) {
        // Rollback optimistic update
        queryClient.setQueryData(['profile', user.user.id], profile);
        toast({
          title: "Grille dupliquée",
          description: "Cette combinaison de pronostics existe déjà",
          variant: "destructive"
        });
        return;
      }

      const nextGridNumber = gridNumbersResult.data && gridNumbersResult.data.length > 0 
        ? gridNumbersResult.data[0].grid_number + 1 
        : 1;

      // Transaction: deduct coins and create grid
      const [coinUpdateResult, gridInsertResult] = await Promise.all([
        supabase
          .from('profiles')
          .update({ coins: profile.coins - calculation.totalCost })
          .eq('user_id', user.user.id),
        supabase
          .from('loto_foot_grids')
          .insert({
            group_id: group.id,
            grid_number: nextGridNumber,
            predictions: predictions as any,
            stake: calculation.minStake,
            potential_winnings: calculation.potentialWinnings,
            cost: calculation.totalCost,
            draw_date: drawDate,
            created_by: user.user.id
          })
          .select()
      ]);

      if (coinUpdateResult.error || gridInsertResult.error) {
        // Rollback optimistic update
        queryClient.setQueryData(['profile', user.user.id], profile);
        throw coinUpdateResult.error || gridInsertResult.error;
      }

      // Optimistic grid update: add new grid to display immediately
      const newGrid = gridInsertResult.data?.[0];
      if (newGrid) {
        queryClient.setQueryData(['loto-foot-grids-display', group.id], (oldData: any) => {
          return oldData ? [newGrid, ...oldData] : [newGrid];
        });
      }

      toast({
        title: "Grille générée !",
        description: `Grille n°${nextGridNumber} créée avec succès`,
      });

      // Reset predictions
      setPredictions([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['profile', user.user.id] });
      queryClient.invalidateQueries({ queryKey: ['loto-foot-grids-display', group.id] });
      
    } catch (error) {
      // Rollback optimistic update on error
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        queryClient.setQueryData(['profile', currentUser.user.id], profile);
      }
      
      console.error('Error generating grid:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer la grille",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculation = calculateGridCosts(predictions);
  const isGridValid = isValidGrid(predictions);
  const hasEnoughMatches = matches.length >= 12; // Au moins 12 matchs requis

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des matchs...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-28 md:pb-0">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Loto Foot - {group.name}
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} membre{memberCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Tirage du {new Date(drawDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </CardContent>
      </Card>

      {hasEnoughMatches ? (
        <>
          {/* Grid */}
          <LotoFootGrid
            matches={matches}
            onPredictionsChange={setPredictions}
            disabled={isGenerating}
          />

          {/* Generate Button (desktop) */}
          <Card className="hidden md:block">
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerateGrid}
                disabled={!isGridValid || isGenerating}
                className="w-full h-12 text-base font-semibold transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none disabled:hover:scale-100"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  `Générer la grille (${calculation.totalCost} SuerteCoins)`
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Fixed bottom CTA (mobile) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <Button
              onClick={handleGenerateGrid}
              disabled={!isGridValid || isGenerating}
              className="w-full h-12 text-base font-semibold transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                `Créer ma grille (${calculation.totalCost} SuerteCoins)`
              )}
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-2">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Matchs non disponibles</h3>
            <p className="text-muted-foreground">
              Les matchs pour ce tirage n'ont pas encore été configurés par l'administrateur.
            </p>
            {matches.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {matches.length} match{matches.length > 1 ? 's' : ''} disponible{matches.length > 1 ? 's' : ''} (minimum 12 requis)
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};