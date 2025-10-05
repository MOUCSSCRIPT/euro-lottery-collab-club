import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

export function getPlayDeadline(gameType: GameType): Date | null {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  switch (gameType) {
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

// Legacy function compatibility
export function getNextPlayDeadline(gameType: GameType): Date {
  return getPlayDeadline(gameType) || new Date();
}

export function formatDeadline(deadline: string | Date): string {
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isAfterDeadline(deadline: string | Date | null): boolean {
  if (!deadline) return false;
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  return new Date() > date;
}

export function getTimeUntilDeadline(deadline: string | Date | null): {
  hours: number;
  minutes: number;
  isExpired: boolean;
} {
  if (!deadline) return { hours: 0, minutes: 0, isExpired: true };
  
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, isExpired: true };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isExpired: false };
}