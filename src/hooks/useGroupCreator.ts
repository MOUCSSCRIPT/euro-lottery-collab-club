import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGroupCreator = (createdBy: string | undefined) => {
  return useQuery({
    queryKey: ['group-creator', createdBy],
    queryFn: async () => {
      if (!createdBy) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', createdBy)
        .single();

      if (error) throw error;
      return data?.username || 'Créateur';
    },
    enabled: !!createdBy,
  });
};