import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGroupCreator = (createdBy: string) => {
  return useQuery({
    queryKey: ['group-creator', createdBy],
    queryFn: async () => {
      if (!createdBy) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', createdBy)
        .single();

      if (error) {
        console.error('Error fetching creator profile:', error);
        return null;
      }

      return data?.username || 'Utilisateur';
    },
    enabled: !!createdBy,
  });
};