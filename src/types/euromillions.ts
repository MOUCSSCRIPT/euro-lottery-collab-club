
export interface EuromillionsOptions {
  gridCount: number;
  luckyNumbers: boolean;
  system: '' | 'System 7' | 'System 8' | 'System 9';
}

export interface EuromillionsGrid {
  mainNumbers: number[];
  stars: number[];
  options: EuromillionsOptions;
  cost: number;
}

export interface PlayerParticipation {
  name: string;
  grids: EuromillionsGrid[];
  totalCost: number;
}

export const EUROMILLIONS_PRICES = {
  baseGrid: 2.50,
  luckyNumbers: 1.00,
  systems: {
    'System 7': 7.00,
    'System 8': 28.00,
    'System 9': 84.00
  }
} as const;
