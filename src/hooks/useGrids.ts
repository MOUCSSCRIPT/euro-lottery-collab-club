
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GridData {
  id: string;
  group_id: string;
  grid_number: number;
  numbers: number[];
  stars: number[] | null;
  cost: number;
  created_at: string;
  draw_date: string | null;
  is_active: boolean;
}

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
      gameType = 'euromillions'
    }: {
      groupId: string;
      budget: number;
      memberCount: number;
      gameType?: 'euromillions' | 'lotto';
    }) => {
      console.log('Generating grids with params:', { groupId, budget, memberCount, gameType });

      // Calculate grid cost and count
      const gridCost = gameType === 'euromillions' ? 2.5 : 2.2;
      const maxGrids = Math.floor(budget / gridCost);
      
      if (maxGrids === 0) {
        throw new Error('Budget insuffisant pour générer des grilles');
      }

      // Generate optimized grids
      const grids = generateOptimizedGrids(maxGrids, gameType);
      
      // Insert grids into database
      const gridData = grids.map((grid, index) => ({
        group_id: groupId,
        grid_number: index + 1,
        numbers: grid.numbers,
        stars: grid.stars,
        cost: gridCost,
        draw_date: getNextDrawDate()
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
      toast({
        title: "Grilles générées !",
        description: `${data.length} grilles ont été créées avec succès.`,
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

// Grid generation algorithm
function generateOptimizedGrids(count: number, gameType: 'euromillions' | 'lotto') {
  const grids = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let grid;
    
    do {
      grid = generateSingleGrid(gameType);
      attempts++;
    } while (usedCombinations.has(grid.key) && attempts < 100);

    if (attempts < 100) {
      usedCombinations.add(grid.key);
      grids.push({
        numbers: grid.numbers,
        stars: grid.stars
      });
    } else {
      // Fallback: generate without duplicate check
      grids.push({
        numbers: grid.numbers,
        stars: grid.stars
      });
    }
  }

  return grids;
}

function generateSingleGrid(gameType: 'euromillions' | 'lotto') {
  if (gameType === 'euromillions') {
    // Euromillions: 5 numbers (1-50) + 2 stars (1-12)
    const numbers = generateUniqueNumbers(5, 1, 50);
    const stars = generateUniqueNumbers(2, 1, 12);
    return {
      numbers: numbers.sort((a, b) => a - b),
      stars: stars.sort((a, b) => a - b),
      key: `${numbers.join('-')}_${stars.join('-')}`
    };
  } else {
    // Lotto: 6 numbers (1-49)
    const numbers = generateUniqueNumbers(6, 1, 49);
    return {
      numbers: numbers.sort((a, b) => a - b),
      stars: null,
      key: numbers.join('-')
    };
  }
}

function generateUniqueNumbers(count: number, min: number, max: number): number[] {
  const numbers = [];
  const available = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    numbers.push(available.splice(randomIndex, 1)[0]);
  }
  
  return numbers;
}

function getNextDrawDate(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Euromillions draws: Tuesday (2) and Friday (5)
  let daysUntilNextDraw;
  if (dayOfWeek < 2) {
    daysUntilNextDraw = 2 - dayOfWeek;
  } else if (dayOfWeek < 5) {
    daysUntilNextDraw = 5 - dayOfWeek;
  } else {
    daysUntilNextDraw = 7 - dayOfWeek + 2; // Next Tuesday
  }
  
  const nextDraw = new Date(today);
  nextDraw.setDate(today.getDate() + daysUntilNextDraw);
  
  return nextDraw.toISOString().split('T')[0];
}
