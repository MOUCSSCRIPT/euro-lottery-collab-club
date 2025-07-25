import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getNextPlayDeadline(gameType: GameType): Date {
  const now = new Date();
  const nextDrawDate = getNextDrawDate(gameType);
  
  // EuroMillions deadline is 20:15 CET on draw day
  const deadline = new Date(nextDrawDate);
  deadline.setHours(20, 15, 0, 0);
  
  return deadline;
}

export function getNextDrawDate(gameType: GameType): Date {
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
  
  return nextDraw;
}

export function isAfterDeadline(deadline: string | Date | null): boolean {
  if (!deadline) return false;
  return new Date() > new Date(deadline);
}

export function formatDeadline(deadline: string | Date | null): string {
  if (!deadline) return '';
  return new Date(deadline).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeUntilDeadline(deadline: string | Date | null): {
  hours: number;
  minutes: number;
  isExpired: boolean;
} {
  if (!deadline) return { hours: 0, minutes: 0, isExpired: true };
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, isExpired: true };
  }
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isExpired: false };
}