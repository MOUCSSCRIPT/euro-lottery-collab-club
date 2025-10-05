
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getNextDrawDate(gameType: GameType): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let daysUntilNextDraw;
  
  switch (gameType) {
    case 'loto_foot':
      // Loto Foot draws: Friday (5)
      // If today is Friday or before, use today's date to check for current week matches
      // Otherwise, find next Friday
      if (dayOfWeek <= 5) {
        daysUntilNextDraw = 0; // Check today first
      } else {
        daysUntilNextDraw = 7 - dayOfWeek + 5; // Next Friday
      }
      break;
    default:
      daysUntilNextDraw = 0; // Check today first
  }
  
  const nextDraw = new Date(today);
  nextDraw.setDate(today.getDate() + daysUntilNextDraw);
  
  return nextDraw.toISOString().split('T')[0];
}
