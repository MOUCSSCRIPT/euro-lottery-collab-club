
import { Database } from '@/integrations/supabase/types';
import { getGridCost } from './gridCosts';
import { getNextDrawDate } from './drawDates';

type GameType = Database['public']['Enums']['game_type'];

export function generateUniqueNumbers(count: number, min: number, max: number): number[] {
  const numbers = [];
  const available = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    numbers.push(available.splice(randomIndex, 1)[0]);
  }
  
  return numbers;
}

export function generateSingleGrid(gameType: GameType, options?: any) {
  switch (gameType) {
    case 'euromillions':
      // Enhanced Euromillions generation with options support
      const numbers = generateUniqueNumbers(5, 1, 50).sort((a, b) => a - b);
      const stars = generateUniqueNumbers(2, 1, 12).sort((a, b) => a - b);
      
      // Calculate cost based on options (in SuerteCoins)
      let cost = 25; // Base cost in SuerteCoins
      if (options?.luckyNumbers) cost += 10;
      if (options?.system && options?.system !== 'none') {
        if (options.system === 'System 7') cost += 70;
        else if (options.system === 'System 8') cost += 280;
        else if (options.system === 'System 9') cost += 840;
      }
      
      // Create key AFTER sorting for consistent comparison
      const key = `${numbers.join('-')}_${stars.join('-')}`;
      
      return {
        numbers,
        stars,
        key,
        cost
      };
    default:
      // Fallback to euromillions
      const defaultNumbers = generateUniqueNumbers(5, 1, 50).sort((a, b) => a - b);
      const defaultStars = generateUniqueNumbers(2, 1, 12).sort((a, b) => a - b);
      const defaultKey = `${defaultNumbers.join('-')}_${defaultStars.join('-')}`;
      
      return {
        numbers: defaultNumbers,
        stars: defaultStars,
        key: defaultKey,
        cost: 25
      };
  }
}

export async function generateOptimizedGrids(count: number, gameType: GameType, options?: any, groupId?: string): Promise<Array<{numbers: number[], stars: number[], cost: number}>> {
  const grids = [];
  const usedCombinations = new Set<string>();
  
  // If groupId is provided, fetch existing grids to avoid duplicates across sessions
  if (groupId) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: existingGrids } = await supabase
        .from('group_grids')
        .select('numbers, stars')
        .eq('group_id', groupId)
        .eq('is_active', true);
      
      if (existingGrids && existingGrids.length > 0) {
        existingGrids.forEach(grid => {
          const sortedNumbers = [...(grid.numbers || [])].sort((a, b) => a - b);
          const sortedStars = grid.stars ? [...(grid.stars || [])].sort((a, b) => a - b) : [];
          const key = `${sortedNumbers.join('-')}_${sortedStars.join('-')}`;
          usedCombinations.add(key);
        });
        console.log(`✅ Loaded ${usedCombinations.size} existing grid combinations to avoid duplicates`);
      }
    } catch (error) {
      console.warn('❌ Could not fetch existing grids for duplicate detection:', error);
    }
  }

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let grid;
    const maxAttempts = Math.max(1000, count * 20); // Increased max attempts further
    
    do {
      grid = generateSingleGrid(gameType, options);
      attempts++;
      
      if (attempts % 100 === 0) {
        console.log(`🔄 Grid ${i + 1}: ${attempts} attempts to find unique combination. Current key: ${grid.key}`);
      }
      
      if (usedCombinations.has(grid.key)) {
        console.log(`🚫 Duplicate detected: ${grid.key} (attempt ${attempts})`);
      }
    } while (usedCombinations.has(grid.key) && attempts < maxAttempts);

    if (attempts < maxAttempts) {
      usedCombinations.add(grid.key);
      grids.push({
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost
      });
      console.log(`✅ Grid ${i + 1} generated successfully after ${attempts} attempts. Key: ${grid.key}`);
    } else {
      console.error(`❌ Grid ${i + 1}: Could not find unique combination after ${attempts} attempts, SKIPPING GRID`);
      // Skip this grid instead of adding a duplicate
      continue;
    }
  }
  
  console.log(`🎯 Final result: Generated ${grids.length} unique grids out of ${count} requested with ${usedCombinations.size} total unique combinations tracked`);
  return grids;
}
