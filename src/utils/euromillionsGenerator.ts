
import { EuromillionsGrid, EuromillionsOptions, EUROMILLIONS_PRICES } from '@/types/euromillions';

export function generateEuromillionsNumbers(): { mainNumbers: number[], stars: number[] } {
  const mainNumbers = generateUniqueNumbers(5, 1, 50);
  const stars = generateUniqueNumbers(2, 1, 12);
  
  return {
    mainNumbers: mainNumbers.sort((a, b) => a - b),
    stars: stars.sort((a, b) => a - b)
  };
}

export function generateSystemGrids(mainNumbers: number[], stars: number[], systemType: string): EuromillionsGrid[] {
  const grids: EuromillionsGrid[] = [];
  
  switch (systemType) {
    case 'System 7':
      // Système 7 : 7 numéros principaux -> 21 combinaisons
      if (mainNumbers.length >= 7) {
        const combinations = generateCombinations(mainNumbers.slice(0, 7), 5);
        combinations.forEach(combo => {
          grids.push({
            mainNumbers: combo.sort((a, b) => a - b),
            stars: stars.slice(0, 2),
            options: { gridCount: 1, luckyNumbers: false, system: 'System 7' },
            cost: EUROMILLIONS_PRICES.baseGrid
          });
        });
      }
      break;
      
    case 'System 8':
      // Système 8 : 8 numéros principaux -> 56 combinaisons
      if (mainNumbers.length >= 8) {
        const combinations = generateCombinations(mainNumbers.slice(0, 8), 5);
        combinations.forEach(combo => {
          grids.push({
            mainNumbers: combo.sort((a, b) => a - b),
            stars: stars.slice(0, 2),
            options: { gridCount: 1, luckyNumbers: false, system: 'System 8' },
            cost: EUROMILLIONS_PRICES.baseGrid
          });
        });
      }
      break;
      
    case 'System 9':
      // Système 9 : 9 numéros principaux -> 126 combinaisons
      if (mainNumbers.length >= 9) {
        const combinations = generateCombinations(mainNumbers.slice(0, 9), 5);
        combinations.forEach(combo => {
          grids.push({
            mainNumbers: combo.sort((a, b) => a - b),
            stars: stars.slice(0, 2),
            options: { gridCount: 1, luckyNumbers: false, system: 'System 9' },
            cost: EUROMILLIONS_PRICES.baseGrid
          });
        });
      }
      break;
  }
  
  return grids;
}

export function generateEuromillionsGrids(options: EuromillionsOptions): EuromillionsGrid[] {
  const grids: EuromillionsGrid[] = [];
  
  for (let i = 0; i < options.gridCount; i++) {
    if (options.system && options.system !== '') {
      // Pour les systèmes, générer plus de numéros pour les combinaisons
      const systemNumbers = options.system === 'System 7' ? 7 : 
                           options.system === 'System 8' ? 8 : 9;
      const mainNumbers = generateUniqueNumbers(systemNumbers, 1, 50);
      const stars = generateUniqueNumbers(2, 1, 12);
      
      const systemGrids = generateSystemGrids(mainNumbers, stars, options.system);
      grids.push(...systemGrids);
    } else {
      // Grille simple
      const { mainNumbers, stars } = generateEuromillionsNumbers();
      
      grids.push({
        mainNumbers,
        stars,
        options: { ...options, gridCount: 1 },
        cost: calculateGridCost(options)
      });
    }
  }
  
  return grids;
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

function generateCombinations(numbers: number[], size: number): number[][] {
  if (size > numbers.length) return [];
  if (size === 1) return numbers.map(n => [n]);
  
  const combinations: number[][] = [];
  
  for (let i = 0; i <= numbers.length - size; i++) {
    const head = numbers[i];
    const tailCombinations = generateCombinations(numbers.slice(i + 1), size - 1);
    
    for (const tail of tailCombinations) {
      combinations.push([head, ...tail]);
    }
  }
  
  return combinations;
}

function calculateGridCost(options: EuromillionsOptions): number {
  let cost = EUROMILLIONS_PRICES.baseGrid;
  
  if (options.luckyNumbers) {
    cost += EUROMILLIONS_PRICES.luckyNumbers;
  }
  
  if (options.system && options.system !== '') {
    cost += EUROMILLIONS_PRICES.systems[options.system];
  }
  
  return cost;
}
