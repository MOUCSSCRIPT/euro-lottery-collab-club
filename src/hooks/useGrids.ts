
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GridData, GenerateGridsParams, ManualGrid } from '@/types/grid';
import { getGridCost } from '@/utils/gridCosts';
import { getNextDrawDate } from '@/utils/drawDates';
import { generateOptimizedGrids } from '@/utils/gridGenerator';

export const useGrids = (groupId: string) => {
  return useQuery({
    queryKey: ['grids', groupId],
    queryFn: async () => {
      console.log('Fetching grids for group:', groupId);
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
      gameType = 'euromillions',
      playerName,
      euromillionsOptions,
      manualGrids
    }: GenerateGridsParams) => {
      console.log('Generating grids with params:', { groupId, budget, memberCount, gameType, playerName, euromillionsOptions, manualGrids });

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Calculate grid cost and count
      const gridCost = getGridCost(gameType);
      let grids;
      let totalCost = 0;

      if (manualGrids && manualGrids.length > 0) {
        // Utiliser les grilles manuelles
        grids = manualGrids.map(grid => ({
          numbers: grid.mainNumbers,
          stars: grid.stars,
          cost: gridCost
        }));
        totalCost = grids.length * gridCost;
      } else {
        // Génération automatique
        const maxGrids = Math.floor(budget / gridCost);
        
        if (maxGrids === 0) {
          throw new Error('Budget insuffisant pour générer des grilles');
        }

        grids = generateOptimizedGrids(maxGrids, gameType, euromillionsOptions);
        totalCost = grids.reduce((sum, grid) => sum + (grid.cost || gridCost), 0);
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
      
      // Insert grids into database
      const gridData = grids.map((grid, index) => ({
        group_id: groupId,
        grid_number: nextGridNumber + index,
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost || gridCost,
        draw_date: getNextDrawDate(gameType),
        player_name: playerName || 'Joueur',
        created_by: user.user.id
      }));

      const { data, error } = await supabase
        .from('group_grids')
        .insert(gridData)
        .select();

      if (error) {
        console.error('Error creating grids:', error);
        throw error;
      }

      console.log('Grids created:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grids', variables.groupId] });
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
