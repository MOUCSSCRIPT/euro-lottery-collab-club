
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getGridCost(gameType: GameType): number {
  switch (gameType) {
    case 'euromillions':
      return 25; // 25 SuerteCoins per grid
    default:
      return 25;
  }
}
