import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GridData, GenerateGridsParams } from '@/types/grid';
import { getGridCost } from '@/utils/gridCosts';
import { getNextDrawDate } from '@/utils/drawDates';
import { generateOptimizedGrids } from '@/utils/gridGenerator';
import { useEffect, useRef } from 'react';

export const useGrids = (groupId: string, gameType?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Real-time listener for grid changes
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
    const channelName = `group-grids-${groupId}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_grids',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('Group grids changed:', payload);
            queryClient.invalidateQueries({ queryKey: ['grids', groupId] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loto_foot_grids',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('Loto foot grids changed:', payload);
            queryClient.invalidateQueries({ queryKey: ['grids', groupId] });
          }
        );

      // Only subscribe if channel was created successfully
      if (channel) {
        channel.subscribe((status) => {
          console.log('Grids subscription status:', status);
        });
        channelRef.current = channel;
      }
    } catch (error) {
      console.log('Error creating grids subscription:', error);
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

  return useQuery({
    queryKey: ['grids', groupId],
    queryFn: async () => {
      console.log('Fetching grids for group:', groupId, 'gameType:', gameType);
      
      if (gameType === 'loto_foot') {
        // Fetch Loto Foot grids
        const { data, error } = await supabase
          .from('loto_foot_grids')
          .select('*')
          .eq('group_id', groupId)
          .eq('is_active', true)
          .order('grid_number');

        if (error) {
          console.error('Error fetching loto foot grids:', error);
          throw error;
        }

        console.log('Loto Foot grids fetched:', data);
        // Transform loto foot grids to match GridData interface
        return (data || []).map(grid => ({
          ...grid,
          numbers: [], // Loto Foot doesn't use numbers
          stars: [], // Loto Foot doesn't use stars
          predictions: grid.predictions // Keep predictions for display
        })) as GridData[];
      } else {
        // Fetch grids
        const { data, error } = await supabase
          .from('group_grids')
          .select('*')
          .eq('group_id', groupId)
          .eq('is_active', true)
          .order('grid_number');

        if (error) {
          console.error('Error fetching grids:', error);
          throw error;
        }

        console.log('Grids fetched:', data);
        return data as GridData[];
      }
    },
    enabled: !!groupId,
  });
};

export const useGenerateGrids = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      groupId,
      budget,
      memberCount,
      gameType = 'loto_foot',
      playerName,
      manualGrids
    }: GenerateGridsParams) => {
      console.log('Generating grids with params:', { groupId, budget, memberCount, gameType, playerName, manualGrids });

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Calculate grid cost and count
      const gridCost = getGridCost(gameType);
      let grids;
      let totalCost = 0;

      let gridsToInsert: Array<{
        numbers: number[],
        stars: number[],
        cost: number
      }> = [];

      if (manualGrids && manualGrids.length > 0) {
        // Gérer les grilles manuelles avec détection de doublons
        gridsToInsert = manualGrids.map(grid => ({
          numbers: grid.mainNumbers,
          stars: grid.stars,
          cost: gridCost
        }));

        // Vérifier les doublons pour les grilles manuelles
        console.log(`🔍 Checking for duplicates among ${gridsToInsert.length} manual grids`);
        
        const { data: existingGrids } = await supabase
          .from('group_grids')
          .select('numbers, stars')
          .eq('group_id', groupId)
          .eq('is_active', true);

        const existingKeys = new Set(
          existingGrids?.map(grid => 
            `${[...grid.numbers].sort((a, b) => a - b).join('-')}_${grid.stars ? [...grid.stars].sort((a, b) => a - b).join('-') : ''}`
          ) || []
        );

        const originalCount = gridsToInsert.length;
        gridsToInsert = gridsToInsert.filter(grid => {
          const key = `${[...grid.numbers].sort((a, b) => a - b).join('-')}_${[...grid.stars].sort((a, b) => a - b).join('-')}`;
          return !existingKeys.has(key);
        });

        const filteredCount = originalCount - gridsToInsert.length;
        if (filteredCount > 0) {
          console.log(`⚠️ Filtered out ${filteredCount} duplicate manual grids`);
          toast({
            title: "Doublons détectés",
            description: `${filteredCount} grille(s) manuelle(s) identique(s) ont été ignorée(s)`,
            variant: "destructive",
          });
        }

        totalCost = gridsToInsert.length * gridCost;
      } else {
        // Génération automatique avec détection de doublons intégrée
        const maxGrids = Math.floor(budget / gridCost);
        
        if (maxGrids === 0) {
          throw new Error('Budget insuffisant pour générer des grilles');
        }

        gridsToInsert = await generateOptimizedGrids(maxGrids, gameType, {}, groupId);
        totalCost = gridsToInsert.reduce((sum, grid) => sum + (grid.cost || gridCost), 0);
      }

      // Vérifier et décompter les coins du joueur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.user.id)
        .single();

      if (profileError) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      if (!profile || profile.coins < totalCost) {
        throw new Error(`Coins insuffisants. Vous avez ${profile?.coins || 0} coins, il en faut ${totalCost}.`);
      }

      if (gridsToInsert.length === 0) {
        throw new Error('Aucune nouvelle grille à insérer (toutes sont des doublons)');
      }

      // Décompter les coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - totalCost })
        .eq('user_id', user.user.id);

      if (updateError) {
        throw new Error('Erreur lors de la déduction des coins');
      }
      
      // Récupérer le nombre de grilles existantes pour la numérotation
      const { data: existingGrids, error: gridError } = await supabase
        .from('group_grids')
        .select('grid_number')
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (gridError) {
        throw new Error('Erreur lors de la récupération des grilles existantes');
      }

      const nextGridNumber = existingGrids ? Math.max(...existingGrids.map(g => g.grid_number), 0) + 1 : 1;
      
      // Préparer les données pour l'insertion avec détection robuste des doublons
      const gridData = gridsToInsert.map((grid, index) => ({
        group_id: groupId,
        grid_number: nextGridNumber + index,
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost || gridCost,
        draw_date: getNextDrawDate(gameType),
        player_name: playerName || 'Joueur',
        created_by: user.user.id
      }));

      console.log(`💾 Inserting ${gridData.length} grids into database`);
      
      // Insérer avec gestion des erreurs de contrainte unique
      try {
        const { data, error } = await supabase
          .from('group_grids')
          .insert(gridData)
          .select();

        if (error) {
          // Si c'est une erreur de contrainte unique, informer l'utilisateur
          if (error.code === '23505') {
            console.warn('⚠️ Duplicate constraint violation detected during insertion');
            throw new Error("Certaines grilles identiques existent déjà. Veuillez réessayer avec d'autres nombres.");
          }
          console.error('Error creating grids:', error);
          throw new Error(`Erreur lors de l'insertion des grilles: ${error.message}`);
        }

        if (!data || data.length === 0) {
          throw new Error('Aucune grille n\'a été créée');
        }

        console.log(`✅ Successfully inserted ${data.length} grids`);
        return data;
      } catch (insertError) {
        // En cas d'erreur, restaurer les coins
        await supabase
          .from('profiles')
          .update({ coins: profile.coins })
          .eq('user_id', user.user.id);
        
        throw insertError;
      }

    },
    onSuccess: (data, variables) => {
      // Optimistically update grids cache
      queryClient.setQueryData(['grids', variables.groupId], (old: GridData[] | undefined) => {
        return [...(old || []), ...data];
      });
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['grids', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Update coins
      queryClient.invalidateQueries({ queryKey: ['groups'] }); // Update group info
      
      const modeText = variables.manualGrids ? 'manuellement' : 'automatiquement';
      toast({
        title: "Grilles générées !",
        description: `${data.length} grilles ont été créées ${modeText} avec succès pour ${variables.playerName || 'le groupe'}.`,
      });
    },
    onError: (error) => {
      console.error('Grid generation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer les grilles",
        variant: "destructive",
      });
    },
  });
};

export type { GridData } from '@/types/grid';
