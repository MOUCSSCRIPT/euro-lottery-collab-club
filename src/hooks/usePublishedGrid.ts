import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublishedGrid {
  id: string;
  name: string | null;
  draw_date: string;
  status: 'draft' | 'published' | 'closed';
  play_deadline: string;
  match_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  published_by: string | null;
}

export const usePublishedGrid = (drawDate: string) => {
  return useQuery({
    queryKey: ['published-grid', drawDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .select('*')
        .eq('draw_date', drawDate)
        .maybeSingle();
      
      if (error) throw error;
      return data as PublishedGrid | null;
    },
    enabled: !!drawDate,
  });
};
