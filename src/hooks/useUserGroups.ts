import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserGroups = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get groups where user is creator
      const { data: createdGroups, error: createdError } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id);

      if (createdError) throw createdError;

      // Get groups where user is member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (*)
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Combine and deduplicate
      const allGroups = [...(createdGroups || [])];
      memberGroups?.forEach(membership => {
        if (membership.groups && !allGroups.find(g => g.id === membership.groups.id)) {
          allGroups.push(membership.groups);
        }
      });

      return allGroups;
    },
    enabled: !!user,
  });
};