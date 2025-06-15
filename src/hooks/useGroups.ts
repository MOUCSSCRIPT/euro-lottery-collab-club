
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Group = Database['public']['Tables']['groups']['Row'];
type GroupInsert = Database['public']['Tables']['groups']['Insert'];
type GroupMember = Database['public']['Tables']['group_members']['Row'];

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            id,
            user_id,
            contribution,
            percentage
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: Omit<GroupInsert, 'created_by'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          contribution: groupData.total_budget || 0,
          percentage: 100,
        });

      if (memberError) throw memberError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Groupe créé",
        description: "Votre groupe a été créé avec succès !",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    groups: groups || [],
    isLoading,
    createGroup: createGroupMutation.mutate,
    isCreating: createGroupMutation.isPending,
  };
};
