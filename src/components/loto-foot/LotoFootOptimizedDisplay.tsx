import React, { memo } from 'react';
import { useLotoFootGridDisplay } from '@/hooks/useLotoFootGridDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Coins } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

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
    // Use current profile if it's the user's grid, otherwise show generic player info
    const isCurrentUser = profile?.user_id === createdBy;
    
    if (isCurrentUser && profile) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getCountryFlag(profile.country)}</span>
          <span>{profile.username || 'Joueur'}</span>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Grille #{grid.grid_number}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {grid.cost}
            </Badge>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <PlayerDisplay createdBy={grid.created_by} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {grid.predictions?.map((pred: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span className="font-medium text-xs">M{pred.match_position}</span>
              <div className="flex gap-1">
                {pred.outcomes?.map((outcome: string, i: number) => (
                  <Badge 
                    key={i} 
                    variant={
                      outcome === '1' ? 'default' : 
                      outcome === 'X' ? 'secondary' : 
                      'outline'
                    }
                    className="text-xs px-1 py-0"
                  >
                    {outcome}
                  </Badge>
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grilles générées ({grids.length})</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Total: {totalCost} coins
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4">
        {grids.map((grid) => (
          <GridCard key={grid.id} grid={grid} />
        ))}
      </div>
    </div>
  );
});

LotoFootOptimizedDisplay.displayName = 'LotoFootOptimizedDisplay';