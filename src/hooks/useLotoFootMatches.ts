import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LotoFootMatch {
  id: string;
  group_id: string;
  match_position: number;
  team_home: string;
  team_away: string;
  match_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLotoFootMatchData {
  group_id: string;
  match_position: number;
  team_home: string;
  team_away: string;
  match_date?: string;
}

export interface UpdateLotoFootMatchData {
  team_home?: string;
  team_away?: string;
  match_date?: string;
}

export const useLotoFootMatches = (groupId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: matches = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['loto-foot-matches', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('group_id', groupId)
        .order('match_position');

      if (error) throw error;
      return data as LotoFootMatch[];
    },
    enabled: !!groupId
  });

  const createMatch = useMutation({
    mutationFn: async (matchData: CreateLotoFootMatchData) => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .insert([matchData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loto-foot-matches', groupId] });
      toast({
        title: "Match ajouté",
        description: "Le match a été ajouté avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le match.",
        variant: "destructive",
      });
    }
  });

  const updateMatch = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLotoFootMatchData }) => {
      const { data: result, error } = await supabase
        .from('loto_foot_matches')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loto-foot-matches', groupId] });
      toast({
        title: "Match modifié",
        description: "Le match a été modifié avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le match.",
        variant: "destructive",
      });
    }
  });

  const deleteMatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loto_foot_matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loto-foot-matches', groupId] });
      toast({
        title: "Match supprimé",
        description: "Le match a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le match.",
        variant: "destructive",
      });
    }
  });

  return {
    matches,
    isLoading,
    error,
    createMatch,
    updateMatch,
    deleteMatch
  };
};