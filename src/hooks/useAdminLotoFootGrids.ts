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
  group_grid_id: string | null;
  instance_index: number;
}

/**
 * Merge expanded single-choice rows back into one visual grid per group_grid_id.
 * Reconstructs multi-choice predictions by merging all instances.
 */
export function mergeGridsByGroup(grids: AdminLotoFootGrid[]): AdminLotoFootGrid[] {
  const grouped = new Map<string, AdminLotoFootGrid[]>();

  for (const grid of grids) {
    const key = grid.group_grid_id || grid.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(grid);
  }

  return Array.from(grouped.values()).map((group) => {
    const first = group[0];

    // Reconstruct merged predictions: combine all single-choice values per match
    const mergedPredictions: Record<string, string[]> = {};
    for (const g of group) {
      const preds = g.predictions as Record<string, any>;
      if (preds && typeof preds === 'object' && !Array.isArray(preds)) {
        for (const [matchId, val] of Object.entries(preds)) {
          if (!mergedPredictions[matchId]) mergedPredictions[matchId] = [];
          const values = Array.isArray(val) ? val : [String(val)];
          for (const v of values) {
            if (!mergedPredictions[matchId].includes(v)) {
              mergedPredictions[matchId].push(v);
            }
          }
        }
      }
    }

    return {
      ...first,
      predictions: mergedPredictions,
      cost: group.reduce((sum, g) => sum + g.cost, 0),
      instance_index: 1,
    };
  });
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
          group_grid_id,
          instance_index,
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
