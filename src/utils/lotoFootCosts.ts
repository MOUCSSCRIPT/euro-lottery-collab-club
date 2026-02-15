import { LotoFootPrediction, GridCalculation } from '@/types/loto-foot';

// Base stake per grid in euros
export const LOTO_FOOT_BASE_STAKE = 1.5;

// Cost per combination in SuerteCoins (1 SC = 1€, FDJ price = 1.50€ per combination)
export const LOTO_FOOT_GRID_COST = 1.5;

// Minimum number of predictions required (can be adjusted based on match count)
export const MIN_PREDICTIONS = 12;

// Prize distribution percentages (based on FDJ Loto Foot)
export const PRIZE_DISTRIBUTION = {
  15: 0.50, // 50% for 15 correct
  14: 0.25, // 25% for 14 correct  
  13: 0.15, // 15% for 13 correct
  12: 0.07, // 7% for 12 correct
  11: 0.02, // 2% for 11 correct
  10: 0.01  // 1% for 10 correct
};

/**
 * Calculate cost from predictions object (player interface - new format)
 * Each match can have 1, 2, or 3 selections
 * Total combinations = product of selections per match
 * Cost = combinations × 25 SC
 */
export function calculateCost(
  predictions: Record<string, string[]>,
  minPredictions: number = MIN_PREDICTIONS
): { combinations: number; cost: number } {
  const values = Object.values(predictions).filter(arr => arr.length > 0);
  
  if (values.length < minPredictions) {
    return { combinations: 0, cost: 0 };
  }
  
  const combinations = values.reduce((acc, preds) => acc * preds.length, 1);
  const cost = combinations * LOTO_FOOT_GRID_COST;
  
  return { combinations, cost };
}

/**
 * Calculate combinations count only (for display during selection)
 * Always returns a value, even if minimum not reached
 */
export function calculateCombinationsPreview(
  predictions: Record<string, string[]>
): number {
  const values = Object.values(predictions).filter(arr => arr.length > 0);
  
  if (values.length === 0) return 0;
  
  return values.reduce((acc, preds) => acc * preds.length, 1);
}

/**
 * Calculate the number of combinations for a grid (old format - LotoFootPrediction[])
 */
export function calculateCombinations(predictions: LotoFootPrediction[]): number {
  if (predictions.length < MIN_PREDICTIONS) return 0;
  
  return predictions.reduce((total, prediction) => {
    return total * Math.max(1, prediction.predictions.length);
  }, 1);
}

/**
 * Calculate grid costs and potential winnings (old format - LotoFootPrediction[])
 */
export function calculateGridCosts(
  predictions: LotoFootPrediction[],
  stake: number = LOTO_FOOT_BASE_STAKE
): GridCalculation {
  const combinations = calculateCombinations(predictions);
  const totalCost = combinations * LOTO_FOOT_GRID_COST;
  
  // Estimate potential winnings based on combinations and stake
  const basePotential = stake * combinations;
  const potentialWinnings = basePotential * 1000;
  
  return {
    totalCombinations: combinations,
    totalCost,
    potentialWinnings,
    minStake: stake
  };
}

/**
 * Check if grid is valid for submission (supports both formats)
 */
export function isValidGrid(
  predictions: LotoFootPrediction[] | Record<string, string[]>,
  minPredictions: number = MIN_PREDICTIONS
): boolean {
  if (Array.isArray(predictions)) {
    // Old format: LotoFootPrediction[]
    const validPredictions = predictions.filter(p => p.predictions.length > 0);
    return validPredictions.length >= minPredictions;
  } else {
    // New format: Record<string, string[]>
    const validPredictions = Object.values(predictions).filter(p => p.length > 0);
    return validPredictions.length >= minPredictions;
  }
}

/**
 * Get prize amount based on correct predictions and total pool
 */
export function getPrizeAmount(
  correctPredictions: number, 
  totalPool: number,
  winnersCount: number = 1
): number {
  const percentage = PRIZE_DISTRIBUTION[correctPredictions as keyof typeof PRIZE_DISTRIBUTION];
  if (!percentage) return 0;
  
  return (totalPool * percentage) / winnersCount;
}
