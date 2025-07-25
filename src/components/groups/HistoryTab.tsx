import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDrawResults, useFetchLatestResults, useGridWins } from '@/hooks/useDrawResults';
import { WinBadge } from '@/components/grids/WinBadge';
import { Star, Hash, Trophy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface HistoryTabProps {
  groupId: string;
}

export const HistoryTab = ({ groupId }: HistoryTabProps) => {
  const { user } = useAuth();
  const { data: drawResults = [], isLoading: drawsLoading } = useDrawResults();
  const { data: gridWins = [], isLoading: winsLoading } = useGridWins(groupId);
  const fetchResults = useFetchLatestResults();

  const handleFetchResults = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour mettre à jour les résultats.",
        variant: "destructive",
      });
      return;
    }
    fetchResults.mutate();
  };

  const getWinsForDraw = (drawResultId: string) => {
    return gridWins.filter(win => win.draw_result_id === drawResultId);
  };

  const getTotalWinnings = () => {
    return gridWins.reduce((total, win) => total + win.prize_amount, 0);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k€`;
    }
    return `${amount}€`;
  };

  if (drawsLoading || winsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Résumé des gains
              </CardTitle>
            </div>
            <Button 
              onClick={handleFetchResults}
              disabled={fetchResults.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${fetchResults.isPending ? 'animate-spin' : ''}`} />
              {fetchResults.isPending ? 'Mise à jour...' : 'Actualiser'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {gridWins.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Grilles gagnantes
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(getTotalWinnings())}
              </div>
              <div className="text-sm text-muted-foreground">
                Total des gains
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {drawResults.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Tirages vérifiés
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historique des tirages</h3>
        
        {drawResults.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Aucun résultat de tirage disponible pour le moment.
              </p>
              <Button 
                onClick={handleFetchResults}
                disabled={fetchResults.isPending}
                className="mt-4"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${fetchResults.isPending ? 'animate-spin' : ''}`} />
                Récupérer les résultats
              </Button>
            </CardContent>
          </Card>
        ) : (
          drawResults.map((draw) => {
            const winsForDraw = getWinsForDraw(draw.id);
            const totalWinningsForDraw = winsForDraw.reduce((sum, win) => sum + win.prize_amount, 0);
            
            return (
              <Card key={draw.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Tirage du {new Date(draw.draw_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      {draw.jackpot_amount && (
                        <p className="text-sm text-muted-foreground">
                          Jackpot: {formatAmount(draw.jackpot_amount)}
                        </p>
                      )}
                    </div>
                    {winsForDraw.length > 0 && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        {winsForDraw.length} gain{winsForDraw.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Winning Numbers Display */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Numéros:</span>
                        <div className="flex space-x-1">
                          {draw.winning_numbers.map((num, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Étoiles:</span>
                        <div className="flex space-x-1">
                          {draw.winning_stars.map((star, idx) => (
                            <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-bold">
                              {star}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Wins for this Draw */}
                  {winsForDraw.length > 0 ? (
                    <div>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-green-700">
                            🎉 Vos grilles gagnantes
                          </h4>
                          <span className="text-sm font-semibold text-green-600">
                            Total: {formatAmount(totalWinningsForDraw)}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          {winsForDraw.map((win) => (
                            <div key={win.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">Grille #{win.grid_id.slice(-4)}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {win.matched_numbers} nums + {win.matched_stars} étoiles
                                </span>
                              </div>
                              <WinBadge 
                                prizeRank={win.prize_rank!}
                                prizeAmount={win.prize_amount}
                                matchedNumbers={win.matched_numbers}
                                matchedStars={win.matched_stars}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Aucune grille gagnante pour ce tirage</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};