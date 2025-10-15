import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LotoFootPlayerStats {
  username: string;
  grid_count: number;
  total_cost: number;
  wins: number;
  percentage: number;
}

export const useLotoFootStats = (drawDate?: string) => {
  return useQuery({
    queryKey: ['loto-foot-stats', drawDate],
    queryFn: async () => {
      let query = supabase
        .from('user_loto_foot_grids')
        .select(`
          user_id,
          cost,
          status,
          profiles!inner(username)
        `);
      
      if (drawDate) {
        query = query.eq('draw_date', drawDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Aggregate stats by user
      const userStatsMap = new Map<string, LotoFootPlayerStats>();
      let totalCost = 0;
      
      data?.forEach((grid: any) => {
        const username = grid.profiles.username || 'Anonyme';
        const existing = userStatsMap.get(username) || {
          username,
          grid_count: 0,
          total_cost: 0,
          wins: 0,
          percentage: 0,
        };
        
        existing.grid_count += 1;
        existing.total_cost += Number(grid.cost);
        if (grid.status === 'won') {
          existing.wins += 1;
        }
        
        totalCost += Number(grid.cost);
        userStatsMap.set(username, existing);
      });
      
      // Calculate percentages
      const stats = Array.from(userStatsMap.values()).map(stat => ({
        ...stat,
        percentage: totalCost > 0 ? (stat.total_cost / totalCost) * 100 : 0,
      }));
      
      // Sort by total cost descending
      stats.sort((a, b) => b.total_cost - a.total_cost);
      
      return { stats, totalCost };
    },
    enabled: true,
  });
};
