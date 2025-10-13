import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/useCartStore';
import { cn } from '@/lib/utils';

interface LotoFootCartBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const LotoFootCartBadge = ({ onClick, className }: LotoFootCartBadgeProps) => {
  const gridCount = useCartStore(state => state.getGridCount());

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn("relative", className)}
      aria-label={`Panier: ${gridCount} grille${gridCount > 1 ? 's' : ''}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {gridCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {gridCount}
        </span>
      )}
    </Button>
  );
};
