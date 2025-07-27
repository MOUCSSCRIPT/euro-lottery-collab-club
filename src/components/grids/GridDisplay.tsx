
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GridData } from '@/hooks/useGrids';
import { Star, Hash, Trophy } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { WinBadge } from './WinBadge';
import { useGridWins } from '@/hooks/useDrawResults';

type GameType = Database['public']['Enums']['game_type'];

interface GridDisplayProps {
  grids: GridData[];
  gameType: GameType;
  groupId?: string;
}

const PlayerDisplay = ({ createdBy, playerName }: { createdBy: string | null; playerName: string | null }) => {
  const { data: profile } = useQuery({
    queryKey: ['player-profile', createdBy],
    queryFn: async () => {
      if (!createdBy) return null;
      const { data } = await supabase
        .from('profiles')
        .select('username, country')
        .eq('user_id', createdBy)
        .single();
      return data;
    },
    enabled: !!createdBy,
  });

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return '🌍';
    
    const countryFlags: { [key: string]: string } = {
      'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'DE': '🇩🇪', 'GB': '🇬🇧',
      'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
      'LU': '🇱🇺', 'IE': '🇮🇪', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿'
    };
    
    return countryFlags[countryCode] || '🌍';
  };

  const displayName = profile?.username || playerName || 'Joueur';
  const flag = getCountryFlag(profile?.country);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{flag}</span>
      <span className="text-sm text-muted-foreground font-medium">{displayName}</span>
    </div>
  );
};

export const GridDisplay = ({ grids, gameType, groupId }: GridDisplayProps) => {
  const { data: gridWins = [] } = useGridWins(groupId);
  if (!grids || grids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grilles générées</CardTitle>
          <CardDescription>
            Aucune grille n'a encore été générée pour ce groupe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Utilisez le générateur ci-dessus pour créer vos grilles
          </div>
        </CardContent>
      </Card>
    );
  }

  const gridLabel = 'Grilles';
  const totalCost = grids.reduce((sum, grid) => sum + grid.cost, 0);

  const renderGridContent = (grid: GridData) => {
    switch (gameType) {
      case 'euromillions':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Hash className="h-4 w-4 text-blue-600" />
                <div className="flex space-x-1">
                  {grid.numbers.map((num, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
              {grid.stars && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="flex space-x-1">
                    {grid.stars.map((star, idx) => (
                      <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {star}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <SuerteCoinsDisplay 
              amount={grid.cost} 
              size="sm" 
              variant="default"
            />
          </div>
        );
      
      case 'loto_foot':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Pronostics sélectionnés :</div>
              <div className="grid grid-cols-5 gap-2">
                {(grid as any).predictions?.map((pred: any, idx: number) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Match {pred.match_position}
                    </div>
                    <div className="flex gap-1 justify-center">
                      {pred.predictions.map((p: string, pIdx: number) => (
                        <Badge 
                          key={pIdx} 
                          variant="outline" 
                          className={`text-xs ${
                            p === '1' ? 'bg-green-50 text-green-700 border-green-200' :
                            p === 'X' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )) || <div className="text-sm text-muted-foreground">Aucun pronostic</div>}
              </div>
            </div>
            <SuerteCoinsDisplay 
              amount={grid.cost} 
              size="sm" 
              variant="default"
            />
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {grid.numbers.map((num, idx) => (
                <Badge key={idx} variant="outline">
                  {num}
                </Badge>
              ))}
            </div>
            <SuerteCoinsDisplay 
              amount={grid.cost} 
              size="sm" 
              variant="default"
            />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{gridLabel} générées</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {grids.length} grilles pour un total de 
              <SuerteCoinsDisplay 
                amount={totalCost} 
                size="sm" 
                variant="default"
              />
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {gameType.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grids.map((grid) => (
            <Card key={grid.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">
                    Grille #{grid.grid_number}
                  </h4>
                  <PlayerDisplay 
                    createdBy={grid.created_by} 
                    playerName={grid.player_name}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {gridWins.find(win => win.grid_id === grid.id) && (
                    <WinBadge 
                      prizeRank={gridWins.find(win => win.grid_id === grid.id)!.prize_rank!}
                      prizeAmount={gridWins.find(win => win.grid_id === grid.id)!.prize_amount}
                      matchedNumbers={gridWins.find(win => win.grid_id === grid.id)!.matched_numbers}
                      matchedStars={gridWins.find(win => win.grid_id === grid.id)!.matched_stars}
                    />
                  )}
                  {grid.draw_date && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
                    </Badge>
                  )}
                </div>
              </div>
              {renderGridContent(grid)}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
