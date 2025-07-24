import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useEffect, useRef } from 'react';

type Group = Database['public']['Tables']['groups']['Row'];
type GroupInsert = Database['public']['Tables']['groups']['Insert'];

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  console.log('useGroups hook - user:', user?.id);

  // Real-time listener for groups changes
  useEffect(() => {
    if (!user?.id) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `groups-changes-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        (payload) => {
          console.log('Groups changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['groups'] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      console.log('Fetching groups for user:', user?.id);
      if (!user) {
        console.log('No user, returning empty array');
        return [];
      }
      
      console.log('Fetching groups...');
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Groups query result:', { data: groupsData, error: groupsError });
      
      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      console.log('Groups fetched successfully:', groupsData);
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
    onSuccess: (newGroup) => {
      // Optimistic update - add new group to cache immediately
      queryClient.setQueryData(['groups', user?.id], (old: Group[] | undefined) => {
        return [newGroup, ...(old || [])];
      });
      
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] }); // Refresh member lists
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

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      console.log('Joining group:', groupId);
      if (!user) throw new Error('User not authenticated');

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Vous êtes déjà membre de ce groupe');
      }

      // Get group info to calculate contribution
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('total_budget, max_members')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        throw groupError;
      }

      // Get current member count
      const { count: memberCount, error: countError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (countError) {
        console.error('Error counting members:', countError);
        throw countError;
      }

      if ((memberCount || 0) >= groupData.max_members) {
        throw new Error('Ce groupe est complet');
      }

      // Calculate equal contribution
      const contribution = groupData.total_budget / groupData.max_members;
      const percentage = 100 / groupData.max_members;

      // Add user as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          contribution,
          percentage,
        });

      if (memberError) {
        console.error('Error joining group:', memberError);
        throw memberError;
      }

      console.log('Successfully joined group');
      return groupId;
    },
    onSuccess: (groupId) => {
      // Optimistic updates
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['grids', groupId] });
      
      toast({
        title: "Groupe rejoint",
        description: "Vous avez rejoint le groupe avec succès !",
      });
    },
    onError: (error) => {
      console.error('Join group failed:', error);
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
    joinGroup: joinGroupMutation.mutate,
    isJoining: joinGroupMutation.isPending,
  };
};
