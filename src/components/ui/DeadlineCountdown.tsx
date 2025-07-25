import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { getTimeUntilDeadline } from '@/utils/playDeadlines';

interface DeadlineCountdownProps {
  deadline: string | Date | null;
  variant?: 'default' | 'compact';
}

export const DeadlineCountdown = ({ deadline, variant = 'default' }: DeadlineCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilDeadline(deadline));

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilDeadline(deadline));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || timeLeft.isExpired) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Délai expiré
      </Badge>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {timeLeft.hours}h{timeLeft.minutes.toString().padStart(2, '0')}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span>
        Temps restant: <strong>{timeLeft.hours}h {timeLeft.minutes}min</strong>
      </span>
    </div>
  );
};