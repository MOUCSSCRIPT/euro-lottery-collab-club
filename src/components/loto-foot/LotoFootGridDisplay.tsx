import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLotoFootGridDisplay } from '@/hooks/useLotoFootGridDisplay';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LotoFootGridDisplayProps {
  groupId: string;
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

export const LotoFootGridDisplay = ({ groupId }: LotoFootGridDisplayProps) => {
  const { data: grids = [], isLoading } = useLotoFootGridDisplay(groupId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Chargement des grilles...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!grids || grids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grilles Loto Foot générées</CardTitle>
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

  const totalCost = grids.reduce((sum, grid) => sum + grid.cost, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Grilles Loto Foot générées</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {grids.length} grille{grids.length > 1 ? 's' : ''} pour un total de 
              <SuerteCoinsDisplay 
                amount={totalCost} 
                size="sm" 
                variant="default"
              />
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Loto Foot
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grids.map((grid) => (
            <Card key={grid.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
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
                  {grid.draw_date && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(grid.draw_date).toLocaleDateString('fr-FR')}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="text-xs text-muted-foreground">Pronostics :</div>
                  <div className="grid grid-cols-5 gap-2">
                    {grid.predictions?.map((pred: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          M{pred.match_position}
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
                <div className="ml-4">
                  <SuerteCoinsDisplay 
                    amount={grid.cost} 
                    size="sm" 
                    variant="default"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};