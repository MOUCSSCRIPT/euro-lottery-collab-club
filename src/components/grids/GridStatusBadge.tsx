import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Trophy, XCircle } from 'lucide-react';

interface GridStatusBadgeProps {
  status: 'pending' | 'finished' | 'won' | 'lost';
  correctPredictions?: number;
}

export const GridStatusBadge = ({ status, correctPredictions }: GridStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'En cours',
      icon: Clock,
      variant: 'default' as const,
      className: 'bg-primary/20 text-primary border-primary/30'
    },
    finished: {
      label: 'Terminé',
      icon: CheckCircle,
      variant: 'secondary' as const,
      className: 'bg-muted text-muted-foreground border-border'
    },
    won: {
      label: 'Gagné',
      icon: Trophy,
      variant: 'default' as const,
      className: 'bg-success/20 text-success border-success/30'
    },
    lost: {
      label: 'Perdu',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-destructive/20 text-destructive border-destructive/30'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
      {correctPredictions !== undefined && correctPredictions !== null && (
        <span className="ml-1 font-bold">({correctPredictions}/15)</span>
      )}
    </Badge>
  );
};
