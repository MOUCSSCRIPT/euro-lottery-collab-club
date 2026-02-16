import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminLotoFootGrid {
  id: string;
  user_id: string;
  username: string;
  player_name: string | null;
  predictions: any;
  cost: number;
  stake: number;
  status: string;
  draw_date: string;
  potential_winnings: number;
  correct_predictions: number | null;
}

export const useAdminLotoFootGrids = (drawDate?: string) => {
  return useQuery({
    queryKey: ['admin-loto-foot-grids', drawDate],
    queryFn: async () => {
      if (!drawDate) return [];

      const { data, error } = await supabase
        .from('user_loto_foot_grids')
        .select(`
          id,
          user_id,
          player_name,
          predictions,
          cost,
          stake,
          status,
          draw_date,
          potential_winnings,
          correct_predictions,
          profiles!inner(username)
        `)
        .eq('draw_date', drawDate);

      if (error) throw error;

      return (data || []).map((grid: any) => ({
        ...grid,
        username: grid.profiles?.username || grid.player_name || 'Anonyme',
      })) as AdminLotoFootGrid[];
    },
    enabled: !!drawDate,
  });
};
