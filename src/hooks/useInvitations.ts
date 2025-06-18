
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type GroupInvitation = Database['public']['Tables']['group_invitations']['Row'];
type GroupInvitationInsert = Database['public']['Tables']['group_invitations']['Insert'];

export const useInvitations = (groupId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['invitations', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId && !!user,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Generate invitation code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invitation_code');

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by: user.id,
          email,
          invitation_code: codeData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: "Invitation créée",
        description: "L'invitation a été créée avec succès !",
      });
    },
    onError: (error) => {
      console.error('Invitation creation failed:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'invitation",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async ({ invitationCode }: { invitationCode: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('group_invitations')
        .select('*, groups(*)')
        .eq('invitation_code', invitationCode)
        .eq('status', 'pending')
        .single();

      if (invitationError) throw new Error('Code d\'invitation invalide');
      if (!invitation) throw new Error('Invitation non trouvée');

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation expirée');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Vous êtes déjà membre de ce groupe');
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          contribution: 0,
          percentage: 0,
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({
          status: 'accepted',
          used_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      return invitation;
    },
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast({
        title: "Groupe rejoint",
        description: `Vous avez rejoint le groupe "${invitation.groups?.name}" !`,
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
    invitations: invitations || [],
    isLoading,
    createInvitation: createInvitationMutation.mutate,
    isCreatingInvitation: createInvitationMutation.isPending,
    joinGroup: joinGroupMutation.mutate,
    isJoiningGroup: joinGroupMutation.isPending,
  };
};
