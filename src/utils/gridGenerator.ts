
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
      const numbers = generateUniqueNumbers(5, 1, 50);
      const stars = generateUniqueNumbers(2, 1, 12);
      
      // Calculate cost based on options
      let cost = 2.5; // Base cost
      if (options?.luckyNumbers) cost += 1.0;
      if (options?.system && options?.system !== 'none') {
        if (options.system === 'System 7') cost += 7.0;
        else if (options.system === 'System 8') cost += 28.0;
        else if (options.system === 'System 9') cost += 84.0;
      }
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        stars: stars.sort((a, b) => a - b),
        key: `${numbers.join('-')}_${stars.join('-')}`,
        cost
      };
    default:
      // Fallback to euromillions
      const defaultNumbers = generateUniqueNumbers(5, 1, 50);
      const defaultStars = generateUniqueNumbers(2, 1, 12);
      return {
        numbers: defaultNumbers.sort((a, b) => a - b),
        stars: defaultStars.sort((a, b) => a - b),
        key: `${defaultNumbers.join('-')}_${defaultStars.join('-')}`,
        cost: 2.5
      };
  }
}

export function generateOptimizedGrids(count: number, gameType: GameType, options?: any) {
  const grids = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let grid;
    
    do {
      grid = generateSingleGrid(gameType, options);
      attempts++;
    } while (usedCombinations.has(grid.key) && attempts < 100);

    if (attempts < 100) {
      usedCombinations.add(grid.key);
      grids.push({
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost
      });
    } else {
      // Fallback: generate without duplicate check
      grids.push({
        numbers: grid.numbers,
        stars: grid.stars,
        cost: grid.cost
      });
    }
  }

  return grids;
}
