import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateOptimizedGrids } from '@/utils/gridGenerator';
import { getNextDrawDate } from '@/utils/drawDates';

interface PersonalGrid {
  id: string;
  user_id: string;
  numbers: number[];
  stars: number[];
  cost: number;
  grid_number?: number;
  player_name?: string;
  created_at: string;
  draw_date?: string;
  is_active: boolean;
}

interface GeneratePersonalGridsParams {
  budget: number;
  playerName?: string;
  euromillionsOptions?: {
    multiple: boolean;
    plus: boolean;
    etoilePlus: boolean;
  };
  manualGrids?: Array<{ numbers: number[]; stars: number[] }>;
}

export const usePersonalEuromillionsGrids = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch personal grids
  const { data: grids, isLoading, error } = useQuery({
    queryKey: ['personal-euromillions-grids', user?.id],
    queryFn: async (): Promise<PersonalGrid[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_grids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Generate personal grids mutation
  const generateGridsMutation = useMutation({
    mutationFn: async (params: GeneratePersonalGridsParams) => {
      if (!user) throw new Error('User not authenticated');

      const { budget, playerName, euromillionsOptions, manualGrids } = params;
      
      // Calculate cost per grid based on options
      const baseGridCost = 2.50;
      const multiplier = euromillionsOptions?.multiple ? 2 : 1;
      const plusCost = euromillionsOptions?.plus ? 1 : 0;
      const etoilePlusCost = euromillionsOptions?.etoilePlus ? 1 : 0;
      const costPerGrid = (baseGridCost + plusCost + etoilePlusCost) * multiplier;

      let gridsToCreate: Array<{ numbers: number[]; stars: number[] }> = [];

      if (manualGrids && manualGrids.length > 0) {
        gridsToCreate = manualGrids;
      } else {
        // Generate automatic grids
        const maxGrids = Math.floor(budget / costPerGrid);
        if (maxGrids === 0) throw new Error('Budget insuffisant pour générer une grille');
        
        const result = await generateOptimizedGrids(maxGrids, 'euromillions');
        gridsToCreate = result.map(grid => ({ numbers: grid.numbers, stars: grid.stars }));
      }

      const totalCost = gridsToCreate.length * costPerGrid;

      // Check user's coins
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.coins < totalCost) {
        throw new Error('SuerteCoins insuffisants');
      }

      // Check for duplicates
      const existingGrids = await supabase
        .from('user_grids')
        .select('numbers, stars')
        .eq('user_id', user.id)
        .eq('draw_date', getNextDrawDate('euromillions'));

      if (existingGrids.data) {
        for (const newGrid of gridsToCreate) {
          const isDuplicate = existingGrids.data.some(existing => 
            JSON.stringify(existing.numbers.sort()) === JSON.stringify(newGrid.numbers.sort()) &&
            JSON.stringify(existing.stars.sort()) === JSON.stringify(newGrid.stars.sort())
          );
          if (isDuplicate) {
            throw new Error('Une grille identique existe déjà');
          }
        }
      }

      // Deduct coins
      const { error: coinError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - totalCost })
        .eq('user_id', user.id);

      if (coinError) throw coinError;

      // Insert grids
      const gridsData = gridsToCreate.map((grid, index) => ({
        user_id: user.id,
        numbers: grid.numbers,
        stars: grid.stars,
        cost: costPerGrid,
        grid_number: index + 1,
        player_name: playerName,
        draw_date: getNextDrawDate('euromillions'),
        is_active: true
      }));

      const { error: insertError } = await supabase
        .from('user_grids')
        .insert(gridsData);

      if (insertError) {
        // Restore coins on error
        await supabase
          .from('profiles')
          .update({ coins: profile.coins })
          .eq('user_id', user.id);
        throw insertError;
      }

      return { gridsCreated: gridsToCreate.length, totalCost };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['personal-euromillions-grids'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(`${result.gridsCreated} grille${result.gridsCreated > 1 ? 's créées' : ' créée'} !`);
    },
    onError: (error) => {
      console.error('Grid generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    },
  });

  return {
    grids,
    isLoading,
    error,
    generateGrids: generateGridsMutation.mutate,
    isGenerating: generateGridsMutation.isPending,
  };
};