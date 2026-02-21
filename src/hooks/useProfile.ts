import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  country?: string;
  coins: number;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Real-time listener for profile changes
  useEffect(() => {
    if (!user?.id) return;

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
    const channelName = `profile-changes-${user.id}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile changed:', payload);
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
          }
        );

      // Only subscribe if channel was created successfully
      if (channel) {
        channel.subscribe((status) => {
          console.log('Profile subscription status:', status);
        });
        channelRef.current = channel;
      }
    } catch (error) {
      console.log('Error creating profile subscription:', error);
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
  }, [user?.id, queryClient]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async ({ username, country }: { username?: string; country?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username,
          country,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const createProfile = useMutation({
    mutationFn: async ({ username, country }: { username?: string; country?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username,
          country,
          coins: 50
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast({
        title: "Profil créé",
        description: "Votre profil a été créé avec 50 coins !",
      });
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le profil.",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    createProfile,
  };
};
