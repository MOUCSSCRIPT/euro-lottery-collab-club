
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

export interface ManualGrid {
  id: string;
  mainNumbers: number[];
  stars: number[];
}

export interface GenerateGridsParams {
  groupId: string;
  budget: number;
  memberCount: number;
  gameType?: 'euromillions' | 'lotto' | 'lotto_foot_15';
  playerName?: string;
  euromillionsOptions?: any;
  manualGrids?: ManualGrid[];
}
