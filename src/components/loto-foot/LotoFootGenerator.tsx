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
import { generateSampleMatches } from '@/utils/lotoFootAlgorithms';
import { Badge } from '@/components/ui/badge';

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
      
      // Try to load existing matches for the draw date
      const { data: existingMatches, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('draw_date', drawDate)
        .order('match_position');

      if (error) throw error;

      if (existingMatches && existingMatches.length === 15) {
        setMatches(existingMatches as LotoFootMatch[]);
      } else {
        // Generate sample matches if none exist
        await generateMatches();
      }
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

  const generateMatches = async () => {
    try {
      const sampleMatches = generateSampleMatches(drawDate);
      
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .insert(sampleMatches as any)
        .select();

      if (error) throw error;
      
      if (data) {
        setMatches(data as LotoFootMatch[]);
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les matchs",
        variant: "destructive"
      });
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

    try {
      setIsGenerating(true);
      
      const calculation = calculateGridCosts(predictions);
      
      // Get next grid number for the group
      const { data: existingGrids } = await supabase
        .from('loto_foot_grids')
        .select('grid_number')
        .eq('group_id', group.id)
        .order('grid_number', { ascending: false })
        .limit(1);

      const nextGridNumber = existingGrids && existingGrids.length > 0 
        ? existingGrids[0].grid_number + 1 
        : 1;

      const { error } = await supabase
        .from('loto_foot_grids')
        .insert({
          group_id: group.id,
          grid_number: nextGridNumber,
          predictions: predictions as any,
          stake: calculation.minStake,
          potential_winnings: calculation.potentialWinnings,
          cost: calculation.totalCost,
          draw_date: drawDate,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Grille générée !",
        description: `Grille n°${nextGridNumber} créée avec succès`,
      });

      // Reset predictions
      setPredictions([]);
      
    } catch (error) {
      console.error('Error generating grid:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la grille",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculation = calculateGridCosts(predictions);
  const isGridValid = isValidGrid(predictions);

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
    <div className="space-y-6">
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

      {/* Grid */}
      <LotoFootGrid
        matches={matches}
        onPredictionsChange={setPredictions}
        disabled={isGenerating}
      />

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerateGrid}
            disabled={!isGridValid || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
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
    </div>
  );
};