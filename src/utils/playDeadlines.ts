import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getPlayDeadline(gameType: GameType): Date | null {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  switch (gameType) {
    case 'euromillions':
      // Euromillions draws: Tuesday (2) at 20:30 and Friday (5) at 20:30
      let deadline = new Date();
      
      if (dayOfWeek < 2 || (dayOfWeek === 2 && (hour < 20 || (hour === 20 && minute < 30)))) {
        // Next Tuesday at 20:30
        deadline.setDate(now.getDate() + (2 - dayOfWeek));
        deadline.setHours(20, 30, 0, 0);
      } else if (dayOfWeek < 5 || (dayOfWeek === 5 && (hour < 20 || (hour === 20 && minute < 30)))) {
        // Next Friday at 20:30
        deadline.setDate(now.getDate() + (5 - dayOfWeek));
        deadline.setHours(20, 30, 0, 0);
      } else {
        // Next Tuesday at 20:30
        deadline.setDate(now.getDate() + (7 - dayOfWeek + 2));
        deadline.setHours(20, 30, 0, 0);
      }
      
      return deadline;
      
    case 'loto_foot':
      // Loto Foot usually has deadlines on Sunday evening
      let lotoDeadline = new Date();
      
      if (dayOfWeek === 0) { // Sunday
        if (hour >= 19) {
          // Next Sunday at 19:00
          lotoDeadline.setDate(now.getDate() + 7);
        }
        lotoDeadline.setHours(19, 0, 0, 0);
      } else {
        // Next Sunday at 19:00
        lotoDeadline.setDate(now.getDate() + (7 - dayOfWeek));
        lotoDeadline.setHours(19, 0, 0, 0);
      }
      
      return lotoDeadline;
      
    default:
      return null;
  }
}