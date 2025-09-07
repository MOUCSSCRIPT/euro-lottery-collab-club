import { LotoFootMatch, LotoFootPrediction, PredictionType } from '@/types/loto-foot';

/**
 * Generate optimized grid combinations
 */
export function generateOptimizedGrids(
  matches: LotoFootMatch[],
  budget: number,
  strategy: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
): LotoFootPrediction[] {
  const predictions: LotoFootPrediction[] = [];
  
  matches.forEach((match, index) => {
    // Utilise une stratégie basée sur la position du match et la stratégie choisie
    let selectedPredictions: PredictionType[] = [];
    
    switch (strategy) {
      case 'conservative':
        // Stratégie conservatrice : favorise le match nul et les équipes à domicile
        selectedPredictions = index % 3 === 0 ? ['X'] : index % 2 === 0 ? ['1'] : ['2'];
        break;
      case 'balanced':
        // Stratégie équilibrée : alterne entre différentes prédictions
        if (index % 4 === 0) selectedPredictions = ['1', 'X'];
        else if (index % 4 === 1) selectedPredictions = ['X', '2'];
        else if (index % 4 === 2) selectedPredictions = ['1', '2'];
        else selectedPredictions = ['1'];
        break;
      case 'aggressive':
        // Stratégie agressive : plus de combinaisons possibles
        if (index % 3 === 0) selectedPredictions = ['1', 'X', '2'];
        else if (index % 3 === 1) selectedPredictions = ['1', '2'];
        else selectedPredictions = ['X', '2'];
        break;
    }
    
    predictions.push({
      match_position: match.match_position,
      predictions: selectedPredictions
    });
  });
  
  return predictions;
}

/**
 * Calculate win detection for a grid
 */
export function calculateWins(
  gridPredictions: LotoFootPrediction[],
  matchResults: LotoFootMatch[]
): { correctPredictions: number; prizeRank: number | null } {
  let correctPredictions = 0;
  
  gridPredictions.forEach(prediction => {
    const match = matchResults.find(m => m.match_position === prediction.match_position);
    if (match && match.result && prediction.predictions.includes(match.result)) {
      correctPredictions++;
    }
  });
  
  // Determine prize rank
  let prizeRank: number | null = null;
  if (correctPredictions >= 10) {
    prizeRank = correctPredictions;
  }
  
  return { correctPredictions, prizeRank };
}

/**
 * Generate sample matches for testing
 */
export function generateSampleMatches(drawDate: string): Partial<LotoFootMatch>[] {
  const teams = [
    ['PSG', 'Lyon'], ['Marseille', 'Monaco'], ['Lille', 'Nice'],
    ['Rennes', 'Strasbourg'], ['Nantes', 'Lens'], ['Bordeaux', 'Montpellier'],
    ['Angers', 'Clermont'], ['Reims', 'Lorient'], ['Brest', 'Troyes'],
    ['Metz', 'Saint-Étienne'], ['Ajaccio', 'Auxerre'], ['Toulouse', 'Valenciennes'],
    ['Le Havre', 'Caen'], ['Bastia', 'Pau'], ['Rodez', 'Niort']
  ];
  
  return teams.map(([home, away], index) => {
    return {
      draw_date: drawDate,
      match_position: index + 1,
      home_team: home,
      away_team: away,
      match_datetime: new Date(drawDate).toISOString(),
      status: 'scheduled' as const
    };
  });
}

/**
 * Prize distribution algorithm
 */
export function distributePrizes(
  grids: any[],
  totalPool: number,
  results: LotoFootMatch[]
): { gridId: string; correctPredictions: number; prize: number }[] {
  const winsByRank: { [key: number]: string[] } = {};
  
  // Calculate wins for each grid
  grids.forEach(grid => {
    const { correctPredictions } = calculateWins(grid.predictions, results);
    if (correctPredictions >= 10) {
      if (!winsByRank[correctPredictions]) {
        winsByRank[correctPredictions] = [];
      }
      winsByRank[correctPredictions].push(grid.id);
    }
  });
  
  const prizes: { gridId: string; correctPredictions: number; prize: number }[] = [];
  
  // Distribute prizes by rank
  Object.entries(winsByRank).forEach(([rank, gridIds]) => {
    const rankNum = parseInt(rank);
    const prizePercentage = {
      15: 0.50, 14: 0.25, 13: 0.15, 12: 0.07, 11: 0.02, 10: 0.01
    }[rankNum] || 0;
    
    const totalPrizeForRank = totalPool * prizePercentage;
    const prizePerGrid = totalPrizeForRank / gridIds.length;
    
    gridIds.forEach(gridId => {
      prizes.push({
        gridId,
        correctPredictions: rankNum,
        prize: prizePerGrid
      });
    });
  });
  
  return prizes;
}