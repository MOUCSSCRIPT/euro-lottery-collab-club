
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

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      console.log('Fetching groups for user:', user?.id);
      if (!user) {
        console.log('No user, returning empty array');
        return [];
      }
      
      // Simplifier la requête pour éviter la récursion - d'abord récupérer juste les groupes
      console.log('Step 1: Fetching groups only...');
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Groups query result:', { data: groupsData, error: groupsError });
      
      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      // Si on a des groupes, récupérer les membres séparément
      if (groupsData && groupsData.length > 0) {
        console.log('Step 2: Fetching group members...');
        const groupIds = groupsData.map(g => g.id);
        
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .in('group_id', groupIds);

        console.log('Members query result:', { data: membersData, error: membersError });
        
        if (membersError) {
          console.warn('Error fetching members, continuing without:', membersError);
          // Continue sans les membres plutôt que de faire échouer toute la requête
          return groupsData.map(group => ({ ...group, group_members: [] }));
        }

        // Combiner les données manuellement
        const groupsWithMembers = groupsData.map(group => ({
          ...group,
          group_members: membersData ? membersData.filter(m => m.group_id === group.id) : []
        }));

        console.log('Final groups with members:', groupsWithMembers);
        return groupsWithMembers;
      }

      console.log('No groups found, returning empty array');
      return groupsData || [];
    },
    enabled: !!user,
  });

  // Log any query errors
  if (error) {
    console.error('Groups query error:', error);
  }

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
    error,
    createGroup: createGroupMutation.mutate,
    isCreating: createGroupMutation.isPending,
  };
};
