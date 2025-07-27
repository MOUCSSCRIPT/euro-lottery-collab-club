export interface LotoFootMatch {
  id: string;
  draw_date: string;
  match_position: number;
  home_team: string;
  away_team: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  match_datetime: string;
  status: 'scheduled' | 'live' | 'finished';
  result?: '1' | 'X' | '2';
  created_at: string;
  updated_at: string;
}

export interface LotoFootPrediction {
  match_position: number;
  predictions: ('1' | 'X' | '2')[];
}

export interface LotoFootGrid {
  id: string;
  group_id: string;
  grid_number: number;
  predictions: LotoFootPrediction[];
  stake: number;
  potential_winnings: number;
  cost: number;
  created_at: string;
  draw_date: string;
  is_active: boolean;
  created_by?: string;
  player_name?: string;
}

export interface LotoFootWin {
  id: string;
  grid_id: string;
  draw_date: string;
  correct_predictions: number;
  prize_rank: number | null;
  prize_amount: number;
  created_at: string;
}

export type PredictionType = '1' | 'X' | '2';

export interface GridCalculation {
  totalCombinations: number;
  totalCost: number;
  potentialWinnings: number;
  minStake: number;
}