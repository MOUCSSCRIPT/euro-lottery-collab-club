import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Users } from 'lucide-react';

interface TeamBadgeProps {
  teamName: string;
  isCreator?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export const TeamBadge = ({ teamName, isCreator, isAdmin, className }: TeamBadgeProps) => {
  const getIcon = () => {
    if (isCreator) return <Crown className="h-3 w-3 mr-1" />;
    if (isAdmin) return <Shield className="h-3 w-3 mr-1" />;
    return <Users className="h-3 w-3 mr-1" />;
  };

  const getVariant = () => {
    if (isCreator) return "default";
    if (isAdmin) return "secondary";
    return "outline";
  };

  const getRole = () => {
    if (isCreator) return "Capitaine";
    if (isAdmin) return "Admin";
    return "Membre";
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getIcon()}
      <span className="font-medium">{teamName}</span>
      <span className="ml-1 text-xs opacity-75">• {getRole()}</span>
    </Badge>
  );
};