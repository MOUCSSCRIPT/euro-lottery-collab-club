import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LotoFootGrid, LotoFootPrediction } from '@/types/loto-foot';
import { useToast } from '@/hooks/use-toast';
import { calculateGridCosts } from '@/utils/lotoFootCosts';

export const useLotoFootGrids = (groupId: string) => {
  return useQuery({
    queryKey: ['loto-foot-grids', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_grids')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(grid => ({
        ...grid,
        predictions: grid.predictions as unknown as LotoFootPrediction[]
      })) as LotoFootGrid[];
    },
    enabled: !!groupId,
  });
};

export const useGenerateLotoFootGrid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      groupId,
      predictions,
      drawDate,
      playerName
    }: {
      groupId: string;
      predictions: LotoFootPrediction[];
      drawDate: string;
      playerName?: string;
    }) => {
      // Get next grid number for the group
      const { data: existingGrids } = await supabase
        .from('loto_foot_grids')
        .select('grid_number')
        .eq('group_id', groupId)
        .order('grid_number', { ascending: false })
        .limit(1);

      const nextGridNumber = existingGrids && existingGrids.length > 0 
        ? existingGrids[0].grid_number + 1 
        : 1;

      const calculation = calculateGridCosts(predictions);
      
      const { data, error } = await supabase
        .from('loto_foot_grids')
        .insert({
          group_id: groupId,
          grid_number: nextGridNumber,
          predictions: predictions as any,
          stake: calculation.minStake,
          potential_winnings: calculation.potentialWinnings,
          cost: calculation.totalCost,
          draw_date: drawDate,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          player_name: playerName
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loto-foot-grids'] });
      toast({
        title: "Grille générée !",
        description: `Grille n°${data.grid_number} créée avec succès`,
      });
    },
    onError: (error) => {
      console.error('Error generating grid:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la grille",
        variant: "destructive"
      });
    }
  });
};