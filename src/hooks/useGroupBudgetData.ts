import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';

export const useGroupBudgetData = (groupId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['group-budget-data', groupId],
    queryFn: async () => {
      if (!groupId) return null;

      // Fetch all grids for this group
      const { data: grids, error: gridsError } = await supabase
        .from('group_grids')
        .select('cost, created_by')
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (gridsError) throw gridsError;

      if (!grids || grids.length === 0) {
        return {
          totalBudgetPlayed: 0,
          userBudgetPlayed: 0,
          userPercentage: 0
        };
      }

      // Calculate total budget played by all players
      const totalBudgetPlayed = grids.reduce((sum, grid) => sum + grid.cost, 0);

      // Calculate budget played by current user
      const userBudgetPlayed = user
        ? grids
            .filter(grid => grid.created_by === user.id)
            .reduce((sum, grid) => sum + grid.cost, 0)
        : 0;

      // Calculate user's real percentage
      const userPercentage = totalBudgetPlayed > 0 
        ? (userBudgetPlayed / totalBudgetPlayed) * 100 
        : 0;

      return {
        totalBudgetPlayed,
        userBudgetPlayed,
        userPercentage
      };
    },
    enabled: !!groupId,
  });
};