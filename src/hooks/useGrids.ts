
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

      // Calculate grid cost and count
      const gridCost = getGridCost(gameType);
      let grids;

      if (manualGrids && manualGrids.length > 0) {
        // Utiliser les grilles manuelles
        grids = manualGrids.map(grid => ({
          numbers: grid.mainNumbers,
          stars: grid.stars,
          cost: gridCost
        }));
      } else {
        // Génération automatique
        const maxGrids = Math.floor(budget / gridCost);
        
        if (maxGrids === 0) {
          throw new Error('Budget insuffisant pour générer des grilles');
        }

        grids = generateOptimizedGrids(maxGrids, gameType, euromillionsOptions);
      }
      
      // Insert grids into database
      const gridData = grids.map((grid, index) => ({
        group_id: groupId,
        grid_number: index + 1,
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost || gridCost,
        draw_date: getNextDrawDate(gameType)
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
