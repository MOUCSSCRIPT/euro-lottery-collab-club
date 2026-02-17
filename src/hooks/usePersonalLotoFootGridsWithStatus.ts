import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PersonalLotoFootGridWithStatus {
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
  status: 'pending' | 'finished' | 'won' | 'lost';
  correct_predictions?: number;
  instance_index?: number;
  group_grid_id?: string;
}

type GridStatus = 'all' | 'pending' | 'finished' | 'won' | 'lost';

export const usePersonalLotoFootGridsWithStatus = (statusFilter: GridStatus = 'all') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-loto-foot-grids-status', user?.id, statusFilter],
    queryFn: async (): Promise<PersonalLotoFootGridWithStatus[]> => {
      if (!user) return [];

      let query = supabase
        .from('user_loto_foot_grids')
        .select('*')
        .eq('user_id', user.id);

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PersonalLotoFootGridWithStatus[];
    },
    enabled: !!user,
  });
};
