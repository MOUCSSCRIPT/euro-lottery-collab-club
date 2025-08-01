import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useEffect, useRef } from 'react';

type GroupMember = Database['public']['Tables']['group_members']['Row'];

export const useGroupMembers = (groupId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Real-time listener for group member changes
  useEffect(() => {
    if (!groupId) return;

    // Clean up existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('Error removing channel:', error);
      }
      channelRef.current = null;
    }

    // Create new channel with unique name
    const channelName = `group-members-${groupId}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_members',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('Group members changed:', payload);
            queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
          }
        );

      // Only subscribe if channel was created successfully
      if (channel) {
        channel.subscribe((status) => {
          console.log('Group members subscription status:', status);
        });
        channelRef.current = channel;
      }
    } catch (error) {
      console.log('Error creating group members subscription:', error);
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.log('Error in cleanup:', error);
        }
        channelRef.current = null;
      }
    };
  }, [groupId, queryClient]);

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId,
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      return groupId;
    },
    onSuccess: () => {
      // Optimistic update - remove user from cache immediately
      if (user && groupId) {
        queryClient.setQueryData(['group-members', groupId], (old: any) =>
          old?.filter((member: any) => member.user_id !== user.id) || []
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Groupe quitté",
        description: "Vous avez quitté le groupe avec succès.",
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

  const isUserMember = (userId: string) => {
    return members?.some(member => member.user_id === userId) || false;
  };

  const currentUserMember = user ? members?.find(member => member.user_id === user.id) : null;

  return {
    members: members || [],
    isLoading,
    error,
    leaveGroup: leaveGroupMutation.mutate,
    isLeaving: leaveGroupMutation.isPending,
    isUserMember,
    currentUserMember,
    memberCount: members?.length || 0,
  };
};
