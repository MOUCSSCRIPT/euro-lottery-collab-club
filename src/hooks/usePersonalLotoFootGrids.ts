import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { calculateGridCosts } from '@/utils/lotoFootCosts';

interface PersonalLotoFootGrid {
  id: string;
  user_id: string;
  predictions: any;
  stake: number;
  potential_winnings: number;
  cost: number;
  created_at: string;
  draw_date: string;
  is_active: boolean;
  player_name?: string;
}

interface GeneratePersonalLotoFootGridParams {
  predictions: Record<string, string>;
  playerName?: string;
  drawDate: string;
}

export const usePersonalLotoFootGrids = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch personal loto foot grids
  const { data: grids, isLoading, error } = useQuery({
    queryKey: ['personal-loto-foot-grids', user?.id],
    queryFn: async (): Promise<PersonalLotoFootGrid[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_loto_foot_grids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Generate personal loto foot grid mutation
  const generateGridMutation = useMutation({
    mutationFn: async (params: GeneratePersonalLotoFootGridParams) => {
      if (!user) throw new Error('User not authenticated');

      const { predictions, playerName, drawDate } = params;
      
      // Validate minimum predictions (12 required)
      const predictionCount = Object.keys(predictions).length;
      if (predictionCount < 12) {
        throw new Error('Au moins 12 pronostics sont requis');
      }

      // Ignore cost calculation for now
      const totalCost = 2;

      // Check user's coins
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.coins < totalCost) {
        throw new Error('SuerteCoins insuffisants');
      }

      // Check for duplicates (same predictions on same draw date)
      const { data: existingGrids } = await supabase
        .from('user_loto_foot_grids')
        .select('predictions')
        .eq('user_id', user.id)
        .eq('draw_date', drawDate);

      if (existingGrids) {
        const isDuplicate = existingGrids.some(existing => 
          JSON.stringify(existing.predictions) === JSON.stringify(predictions)
        );
        if (isDuplicate) {
          throw new Error('Une grille identique existe déjà pour ce tirage');
        }
      }

      // Deduct coins
      const { error: coinError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - totalCost })
        .eq('user_id', user.id);

      if (coinError) throw coinError;

      // Insert grid
      const { error: insertError } = await supabase
        .from('user_loto_foot_grids')
        .insert({
          user_id: user.id,
          predictions,
          stake: 2,
          potential_winnings: 50, // Fixed potential winnings for now
          cost: totalCost,
          draw_date: drawDate,
          is_active: true,
          player_name: playerName
        });

      if (insertError) {
        // Restore coins on error
        await supabase
          .from('profiles')
          .update({ coins: profile.coins })
          .eq('user_id', user.id);
        throw insertError;
      }

      return { totalCost, potentialWinnings: 50 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['personal-loto-foot-grids'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Grille Loto Foot créée !');
    },
    onError: (error) => {
      console.error('Loto foot grid generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    },
  });

  return {
    grids,
    isLoading,
    error,
    generateGrid: generateGridMutation.mutate,
    isGenerating: generateGridMutation.isPending,
  };
};