import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ... keep existing code (useUserRole, useAllProfiles, useAddCoins, useSetCoins)
export const useUserRole = () => {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.role || 'user';
    },
  });
};

export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');

      if (error) throw error;
      return data;
    },
  });
};

export const useAddCoins = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const { data, error } = await supabase.rpc('add_coins_to_user', {
        _user_id: userId,
        _amount: amount
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast({
        title: "Succès",
        description: "Coins ajoutés avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSetCoins = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const { data, error } = await supabase.rpc('set_user_coins', {
        _user_id: userId,
        _amount: amount
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast({
        title: "Succès",
        description: "Solde modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ username, email, country }: { username: string; email?: string; country?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-players', {
        body: { action: 'create', username, email, country },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast({
        title: "Joueur créé",
        description: "Le joueur a été ajouté avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-players', {
        body: { action: 'delete', user_id: userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast({
        title: "Joueur supprimé",
        description: "Le joueur a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};