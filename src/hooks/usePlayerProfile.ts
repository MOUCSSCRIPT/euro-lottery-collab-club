import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlayerProfile {
  id: string;
  user_id: string;
  username: string | null;
  country: string | null;
}

export const usePlayerProfile = (userId: string | null | undefined) => {
  return useQuery({
    queryKey: ['player-profile', userId],
    queryFn: async (): Promise<PlayerProfile | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, country')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching player profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};