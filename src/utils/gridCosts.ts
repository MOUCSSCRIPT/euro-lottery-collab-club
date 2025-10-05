
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getGridCost(gameType: GameType): number {
  // Only Loto Foot is supported now
  return 25;
}
