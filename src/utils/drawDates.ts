
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getNextDrawDate(gameType: GameType): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let daysUntilNextDraw;
  
  switch (gameType) {
    case 'euromillions':
      // Euromillions draws: Tuesday (2) and Friday (5)
      if (dayOfWeek < 2) {
        daysUntilNextDraw = 2 - dayOfWeek;
      } else if (dayOfWeek < 5) {
        daysUntilNextDraw = 5 - dayOfWeek;
      } else {
        daysUntilNextDraw = 7 - dayOfWeek + 2; // Next Tuesday
      }
      break;
    default:
      daysUntilNextDraw = 1; // Default to tomorrow
  }
  
  const nextDraw = new Date(today);
  nextDraw.setDate(today.getDate() + daysUntilNextDraw);
  
  return nextDraw.toISOString().split('T')[0];
}
