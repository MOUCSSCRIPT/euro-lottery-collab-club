
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getGridCost(gameType: GameType): number {
  switch (gameType) {
    case 'euromillions':
      return 2.5;
    default:
      return 2.5;
  }
}
