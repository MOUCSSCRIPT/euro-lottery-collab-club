
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

  console.log('useGroups hook - user:', user?.id);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      console.log('Fetching groups for user:', user?.id);
      if (!user) {
        console.log('No user, returning empty array');
        return [];
      }
      
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

      console.log('Groups query result:', { data, error });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: Omit<GroupInsert, 'created_by'>) => {
      console.log('Creating group:', groupData);
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      console.log('Group created successfully:', data);

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          contribution: groupData.total_budget || 0,
          percentage: 100,
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
        throw memberError;
      }

      console.log('Member added successfully');
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
      console.error('Group creation failed:', error);
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
