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
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    finished: {
      label: 'Terminé',
      icon: CheckCircle,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    won: {
      label: 'Gagné',
      icon: Trophy,
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    lost: {
      label: 'Perdu',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 border-red-200'
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
