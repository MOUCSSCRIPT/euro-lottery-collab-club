
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
    case 'lotto':
      // Lotto draws: Monday (1), Wednesday (3), Saturday (6)
      if (dayOfWeek < 1) {
        daysUntilNextDraw = 1 - dayOfWeek;
      } else if (dayOfWeek < 3) {
        daysUntilNextDraw = 3 - dayOfWeek;
      } else if (dayOfWeek < 6) {
        daysUntilNextDraw = 6 - dayOfWeek;
      } else {
        daysUntilNextDraw = 7 - dayOfWeek + 1; // Next Monday
      }
      break;
    case 'lotto_foot_15':
      // Loto Foot 15: Usually Saturday (6)
      if (dayOfWeek < 6) {
        daysUntilNextDraw = 6 - dayOfWeek;
      } else {
        daysUntilNextDraw = 7 - dayOfWeek + 6; // Next Saturday
      }
      break;
    default:
      daysUntilNextDraw = 1; // Default to tomorrow
  }
  
  const nextDraw = new Date(today);
  nextDraw.setDate(today.getDate() + daysUntilNextDraw);
  
  return nextDraw.toISOString().split('T')[0];
}
