import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TeamJoinRequest = Database['public']['Tables']['team_join_requests']['Row'];
type TeamJoinRequestInsert = Database['public']['Tables']['team_join_requests']['Insert'];

export const useTeamRequests = (groupId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending requests for a team (for admins)
  const { data: pendingRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['team-requests', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('team_join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId && !!user,
  });

  // Request to join a team
  const requestToJoinTeamMutation = useMutation({
    mutationFn: async ({ teamCode, message }: { teamCode: string; message?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Find the group by invitation code
      const { data: invitation, error: invitationError } = await supabase
        .from('group_invitations')
        .select('group_id, groups(*)')
        .eq('invitation_code', teamCode)
        .single();

      if (invitationError || !invitation) {
        throw new Error('Code de TEAM invalide');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Vous êtes déjà membre de cette TEAM');
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('team_join_requests')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Vous avez déjà une demande en attente pour cette TEAM');
      }

      // Create join request
      const { data, error } = await supabase
        .from('team_join_requests')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return { request: data, team: invitation.groups };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      toast({
        title: "Demande envoyée",
        description: `Votre demande pour rejoindre la TEAM "${data.team?.name}" a été envoyée !`,
      });
    },
    onError: (error) => {
      console.error('Request to join team failed:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve a join request
  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('team_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        throw new Error('Demande non trouvée');
      }

      // Add user to group members
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: request.group_id,
          user_id: request.user_id,
          contribution: 0,
          percentage: 0,
        });

      if (memberError) throw memberError;

      // Update request status
      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast({
        title: "Demande approuvée",
        description: "Le joueur a été ajouté à votre TEAM !",
      });
    },
    onError: (error) => {
      console.error('Approve request failed:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject a join request
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('team_join_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId);

      if (error) throw error;
      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée.",
      });
    },
    onError: (error) => {
      console.error('Reject request failed:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pendingRequests: pendingRequests || [],
    isLoadingRequests,
    requestToJoinTeam: requestToJoinTeamMutation.mutate,
    isRequestingToJoin: requestToJoinTeamMutation.isPending,
    approveRequest: approveRequestMutation.mutate,
    isApprovingRequest: approveRequestMutation.isPending,
    rejectRequest: rejectRequestMutation.mutate,
    isRejectingRequest: rejectRequestMutation.isPending,
  };
};