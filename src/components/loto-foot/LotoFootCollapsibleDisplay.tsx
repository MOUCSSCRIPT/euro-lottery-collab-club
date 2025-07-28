import React, { memo } from 'react';
import { useLotoFootGridDisplay } from '@/hooks/useLotoFootGridDisplay';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Coins, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LotoFootOptimizedDisplay } from './LotoFootOptimizedDisplay';

interface LotoFootCollapsibleDisplayProps {
  groupId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const LotoFootCollapsibleDisplay = memo(({ 
  groupId, 
  isOpen, 
  onToggle 
}: LotoFootCollapsibleDisplayProps) => {
  const { data: grids, isLoading } = useLotoFootGridDisplay(groupId);

  const gridCount = grids?.length || 0;
  const totalCost = grids?.reduce((sum, grid) => sum + Number(grid.cost), 0) || 0;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between transition-all duration-200",
            isOpen && "bg-muted"
          )}
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>Grilles générées</span>
            {gridCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {gridCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalCost > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3" />
                {totalCost}
              </Badge>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )} />
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 animate-accordion-down">
        <div className="pt-4">
          <LotoFootOptimizedDisplay groupId={groupId} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

LotoFootCollapsibleDisplay.displayName = 'LotoFootCollapsibleDisplay';