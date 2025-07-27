import { LotoFootMatch, LotoFootPrediction, PredictionType } from '@/types/loto-foot';

/**
 * Dynamic odds calculation algorithm based on team statistics
 */
export function calculateDynamicOdds(
  homeTeam: string,
  awayTeam: string,
  matchDate: Date
): { home_odds: number; draw_odds: number; away_odds: number } {
  // Base probabilities (simplified algorithm)
  const homeAdvantage = 0.45; // Home team advantage
  const drawProbability = 0.25;
  const awayProbability = 0.30;
  
  // Apply random variations to simulate real market conditions
  const variation = 0.1;
  const homeProb = homeAdvantage + (Math.random() - 0.5) * variation;
  const drawProb = drawProbability + (Math.random() - 0.5) * variation;
  const awayProb = 1 - homeProb - drawProb;
  
  // Convert probabilities to odds (with bookmaker margin)
  const margin = 0.05; // 5% margin
  const factor = 1 - margin;
  
  return {
    home_odds: Math.round((factor / homeProb) * 100) / 100,
    draw_odds: Math.round((factor / drawProb) * 100) / 100,
    away_odds: Math.round((factor / awayProb) * 100) / 100
  };
}

/**
 * Generate optimized grid combinations
 */
export function generateOptimizedGrids(
  matches: LotoFootMatch[],
  budget: number,
  strategy: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
): LotoFootPrediction[] {
  const predictions: LotoFootPrediction[] = [];
  
  matches.forEach(match => {
    const odds = [match.home_odds, match.draw_odds, match.away_odds];
    const minOddsIndex = odds.indexOf(Math.min(...odds));
    
    let selectedPredictions: PredictionType[] = [];
    
    switch (strategy) {
      case 'conservative':
        // Pick most likely outcome
        selectedPredictions = [['1', 'X', '2'][minOddsIndex] as PredictionType];
        break;
        
      case 'balanced':
        // Pick 2 most likely outcomes
        const sortedIndices = odds
          .map((odd, index) => ({ odd, index }))
          .sort((a, b) => a.odd - b.odd)
          .slice(0, 2)
          .map(item => item.index);
        selectedPredictions = sortedIndices.map(i => ['1', 'X', '2'][i] as PredictionType);
        break;
        
      case 'aggressive':
        // Pick all outcomes for high-odds matches
        if (Math.min(...odds) > 2.0) {
          selectedPredictions = ['1', 'X', '2'];
        } else {
          selectedPredictions = [['1', 'X', '2'][minOddsIndex] as PredictionType];
        }
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
    const odds = calculateDynamicOdds(home, away, new Date(drawDate));
    return {
      draw_date: drawDate,
      match_position: index + 1,
      home_team: home,
      away_team: away,
      ...odds,
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