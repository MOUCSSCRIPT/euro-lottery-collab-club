import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Crown } from 'lucide-react';

interface WinBadgeProps {
  prizeRank: number;
  prizeAmount: number;
  matchedNumbers: number;
  matchedStars: number;
}

export const WinBadge = ({ prizeRank, prizeAmount, matchedNumbers, matchedStars }: WinBadgeProps) => {
  const getPrizeInfo = () => {
    switch (prizeRank) {
      case 1:
        return {
          variant: 'default' as const,
          icon: <Crown className="w-3 h-3" />,
          className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300',
          label: 'JACKPOT!'
        };
      case 2:
      case 3:
        return {
          variant: 'secondary' as const,
          icon: <Trophy className="w-3 h-3" />,
          className: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-300',
          label: `${prizeRank}er rang`
        };
      case 4:
      case 5:
      case 6:
        return {
          variant: 'outline' as const,
          icon: <Star className="w-3 h-3" />,
          className: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300',
          label: `${prizeRank}e rang`
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <Star className="w-3 h-3" />,
          className: 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-300',
          label: `${prizeRank}e rang`
        };
    }
  };

  const { icon, className, label } = getPrizeInfo();

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k€`;
    }
    return `${amount}€`;
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge className={className}>
        <div className="flex items-center gap-1">
          {icon}
          <span className="font-bold">{label}</span>
        </div>
      </Badge>
      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          {matchedNumbers} nums + {matchedStars} étoiles
        </div>
        <div className="text-sm font-semibold text-primary">
          {formatAmount(prizeAmount)}
        </div>
      </div>
    </div>
  );
};