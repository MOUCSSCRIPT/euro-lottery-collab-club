import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublishedGrid } from './usePublishedGrid';

export const useNextPublishedGrid = () => {
  return useQuery({
    queryKey: ['next-published-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .select('*')
        .eq('status', 'published')
        .gte('play_deadline', new Date().toISOString())
        .order('play_deadline', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as PublishedGrid | null;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
