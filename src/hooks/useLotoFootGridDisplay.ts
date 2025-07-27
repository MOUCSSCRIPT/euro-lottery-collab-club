import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LotoFootGrid } from '@/types/loto-foot';

export const useLotoFootGridDisplay = (groupId: string) => {
  return useQuery({
    queryKey: ['loto-foot-grids-display', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_grids')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(grid => ({
        ...grid,
        predictions: grid.predictions as unknown as any[]
      })) as (LotoFootGrid & { predictions: any[] })[];
    },
    enabled: !!groupId,
  });
};