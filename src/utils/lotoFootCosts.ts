import { LotoFootPrediction, GridCalculation } from '@/types/loto-foot';

// Base stake per grid in euros
export const LOTO_FOOT_BASE_STAKE = 1;

// Cost per grid in SuerteCoins (equivalent to base stake)
export const LOTO_FOOT_GRID_COST = 25; // 25 SuerteCoins = 1€

// Prize distribution percentages (based on FDJ Loto Foot)
export const PRIZE_DISTRIBUTION = {
  15: 0.50, // 50% for 15 correct
  14: 0.25, // 25% for 14 correct  
  13: 0.15, // 15% for 13 correct
  12: 0.07, // 7% for 12 correct
  11: 0.02, // 2% for 11 correct
  10: 0.01  // 1% for 10 correct
};

// Minimum number of predictions required
export const MIN_PREDICTIONS = 12;

/**
 * Calculate the number of combinations for a grid
 */
export function calculateCombinations(predictions: LotoFootPrediction[]): number {
  if (predictions.length < MIN_PREDICTIONS) return 0;
  
  return predictions.reduce((total, prediction) => {
    return total * Math.max(1, prediction.predictions.length);
  }, 1);
}

/**
 * Calculate grid costs and potential winnings
 */
export function calculateGridCosts(
  predictions: LotoFootPrediction[],
  stake: number = LOTO_FOOT_BASE_STAKE
): GridCalculation {
  const combinations = calculateCombinations(predictions);
  const totalCost = combinations * LOTO_FOOT_GRID_COST;
  
  // Estimate potential winnings based on combinations and stake
  // This is a simplified calculation - real winnings depend on the prize pool
  const basePotential = stake * combinations;
  const potentialWinnings = basePotential * 1000; // Rough multiplier for 15 correct
  
  return {
    totalCombinations: combinations,
    totalCost,
    potentialWinnings,
    minStake: stake
  };
}

/**
 * Calculate odds for potential winnings
 */
export function calculateOdds(predictions: LotoFootPrediction[]): number {
  if (predictions.length === 0) return 0;
  
  return predictions.reduce((totalOdds, prediction) => {
    if (prediction.predictions.length === 0) return totalOdds;
    
    // For multiple predictions on same match, take average odds
    const avgOdds = prediction.predictions.length > 1 
      ? 2.0 // Conservative estimate for multiple predictions
      : 2.5; // Average odds for single prediction
    
    return totalOdds * avgOdds;
  }, 1);
}

/**
 * Check if grid is valid for submission
 */
export function isValidGrid(predictions: LotoFootPrediction[]): boolean {
  const validPredictions = predictions.filter(p => p.predictions.length > 0);
  return validPredictions.length >= MIN_PREDICTIONS;
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