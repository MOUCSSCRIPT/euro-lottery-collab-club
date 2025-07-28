import React, { memo } from 'react';
import { useLotoFootGridDisplay } from '@/hooks/useLotoFootGridDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Coins } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';

interface LotoFootOptimizedDisplayProps {
  groupId: string;
}

// Memoized component for better performance
const GridCard = memo(({ grid }: { grid: any }) => {
  const { profile } = useProfile();
  
  const getCountryFlag = (country?: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷', 'BE': '🇧🇪', 'CH': '🇨🇭', 'CA': '🇨🇦',
      'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'SN': '🇸🇳'
    };
    return flags[country || 'FR'] || '🌍';
  };

  const PlayerDisplay = ({ createdBy }: { createdBy: string }) => {
    const { data: playerProfile } = usePlayerProfile(createdBy);
    const isCurrentUser = profile?.user_id === createdBy;
    
    // Use current profile if it's the user's grid, otherwise use fetched player profile
    const displayProfile = isCurrentUser ? profile : playerProfile;
    
    if (displayProfile) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getCountryFlag(displayProfile.country)}</span>
          <span>{displayProfile.username || 'Joueur'}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🌍</span>
        <span>Joueur</span>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              #{grid.grid_number}
            </Badge>
            <PlayerDisplay createdBy={grid.created_by} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-primary">
              <Coins className="h-3 w-3" />
              {grid.cost}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          {grid.predictions?.map((pred: any, index: number) => (
            <div key={index} className="flex flex-col items-center p-1.5 rounded bg-muted/30">
              <span className="font-medium text-xs text-muted-foreground mb-1">M{pred.match_position}</span>
              <div className="flex gap-0.5">
                {pred.outcomes?.map((outcome: string, i: number) => (
                  <div
                    key={i} 
                    className={`w-5 h-5 rounded text-xs flex items-center justify-center font-medium ${
                      outcome === '1' ? 'bg-primary text-primary-foreground' : 
                      outcome === 'X' ? 'bg-secondary text-secondary-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

GridCard.displayName = 'GridCard';

export const LotoFootOptimizedDisplay = memo(({ groupId }: LotoFootOptimizedDisplayProps) => {
  const { data: grids, isLoading, error } = useLotoFootGridDisplay(groupId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des grilles...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Erreur lors du chargement des grilles
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!grids || grids.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Aucune grille générée pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalCost = grids.reduce((sum, grid) => sum + Number(grid.cost), 0);

  return (
    <div className="space-y-3">
      {grids.map((grid) => (
        <GridCard key={grid.id} grid={grid} />
      ))}
    </div>
  );
});

LotoFootOptimizedDisplay.displayName = 'LotoFootOptimizedDisplay';