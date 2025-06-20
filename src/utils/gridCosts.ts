
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getGridCost(gameType: GameType): number {
  switch (gameType) {
    case 'euromillions':
      return 2.5;
    case 'lotto':
      return 2.2;
    case 'lotto_foot_15':
      return 2.0;
    default:
      return 2.5;
  }
}
