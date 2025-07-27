import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LotoFootMatch } from '@/types/loto-foot';

export const useLotoFootMatches = (drawDate: string) => {
  return useQuery({
    queryKey: ['loto-foot-matches', drawDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('draw_date', drawDate)
        .order('match_position');

      if (error) throw error;
      return data as LotoFootMatch[];
    },
    enabled: !!drawDate,
  });
};