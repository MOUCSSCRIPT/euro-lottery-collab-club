import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DrawResult {
  id: string;
  draw_date: string;
  winning_numbers: number[];
  winning_stars: number[];
  jackpot_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface GridWin {
  id: string;
  grid_id: string;
  draw_result_id: string;
  matched_numbers: number;
  matched_stars: number;
  prize_rank: number | null;
  prize_amount: number;
  created_at: string;
}

export const useDrawResults = () => {
  return useQuery({
    queryKey: ['draw-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draw_results')
        .select('*')
        .order('draw_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as DrawResult[];
    },
  });
};

export const useGridWins = (groupId?: string) => {
  return useQuery({
    queryKey: ['grid-wins', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      // First get grid IDs for this group
      const { data: gridIds, error: gridError } = await supabase
        .from('group_grids')
        .select('id')
        .eq('group_id', groupId);

      if (gridError) {
        throw gridError;
      }

      if (!gridIds || gridIds.length === 0) {
        return [];
      }

      const gridIdStrings = gridIds.map(g => g.id);

      const { data, error } = await supabase
        .from('grid_wins')
        .select(`
          *,
          draw_results:draw_result_id (
            draw_date,
            winning_numbers,
            winning_stars,
            jackpot_amount
          )
        `)
        .in('grid_id', gridIdStrings);

      if (error) {
        throw error;
      }

      return data as (GridWin & { draw_results: DrawResult })[];
    },
    enabled: !!groupId,
  });
};

export const useFetchLatestResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-euromillions-results');

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw-results'] });
      queryClient.invalidateQueries({ queryKey: ['grid-wins'] });
      toast({
        title: "Résultats mis à jour",
        description: "Les derniers résultats EuroMillions ont été récupérés avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error fetching results:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les derniers résultats.",
        variant: "destructive",
      });
    },
  });
};