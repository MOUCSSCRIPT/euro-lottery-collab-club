/**
 * Normalize predictions for reliable duplicate detection
 * Sorts both match IDs and prediction arrays to ensure consistent comparison
 */
export function normalizePredictions(predictions: Record<string, string[]>): string {
  const sorted = Object.keys(predictions)
    .sort()
    .reduce((acc, key) => {
      acc[key] = [...predictions[key]].sort();
      return acc;
    }, {} as Record<string, string[]>);
  
  return JSON.stringify(sorted);
}

/**
 * Compare two grids for equality
 */
export function areGridsEqual(
  grid1: Record<string, string[]>,
  grid2: Record<string, string[]>
): boolean {
  return normalizePredictions(grid1) === normalizePredictions(grid2);
}
