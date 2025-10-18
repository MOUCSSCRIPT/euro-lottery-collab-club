import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublishedGrid } from './usePublishedGrid';

export const usePublishedGrids = () => {
  return useQuery({
    queryKey: ['published-grids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .select('*')
        .eq('status', 'published')
        .order('play_deadline', { ascending: true });
      
      if (error) throw error;
      return data as PublishedGrid[];
    },
  });
};

export const useClosePublishedGrid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gridId: string) => {
      const { error } = await supabase
        .from('loto_foot_published_grids')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', gridId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-grids'] });
    },
  });
};
