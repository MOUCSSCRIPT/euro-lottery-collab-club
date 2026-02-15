import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalLotoFootGridsWithStatus } from '@/hooks/usePersonalLotoFootGridsWithStatus';
import { GridStatusBadge } from '@/components/grids/GridStatusBadge';
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type GridStatus = 'all' | 'pending' | 'finished' | 'won' | 'lost';

const PlayerStats = () => {
  const [statusFilter, setStatusFilter] = useState<GridStatus>('all');
  const { data: grids, isLoading } = usePersonalLotoFootGridsWithStatus(statusFilter);

  const getStatusIcon = (status: GridStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'won': return Trophy;
      case 'lost': return XCircle;
      case 'finished': return CheckCircle;
      default: return Trophy;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <MobileHeader title="Mes statistiques" showBack className="md:hidden" />

      <main className="container mx-auto px-4 pt-4 pb-28">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mes grilles</h1>

          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as GridStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                En cours
              </TabsTrigger>
              <TabsTrigger value="won" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Gagnées
              </TabsTrigger>
              <TabsTrigger value="lost" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Perdues
              </TabsTrigger>
              <TabsTrigger value="finished" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Terminées
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              ) : grids && grids.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    {grids.length} grille{grids.length > 1 ? 's' : ''} trouvée{grids.length > 1 ? 's' : ''}
                  </div>
                  {grids.map((grid) => (
                    <Card key={grid.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex flex-col gap-2">
                            <span className="text-lg">
                              {grid.player_name || 'Grille anonyme'}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                              Tirage du {format(new Date(grid.draw_date), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          <GridStatusBadge 
                            status={grid.status} 
                            correctPredictions={grid.correct_predictions}
                          />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Display predictions */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {(() => {
                            const preds = grid.predictions;
                            // New format: array of {match_position, predictions: string[]}
                            if (Array.isArray(preds)) {
                              return preds.map((item: any, index: number) => {
                                const predValues = Array.isArray(item.predictions) ? item.predictions : [item.predictions];
                                const label = predValues.join('/');
                                return (
                                  <div 
                                    key={index}
                                    className="p-2 rounded-md text-center font-bold text-sm bg-muted"
                                  >
                                    Match {item.match_position || index + 1}: {label}
                                  </div>
                                );
                              });
                            }
                            // Old format: Record<string, string | string[]>
                            return Object.entries(preds as Record<string, any>).map(([matchId, prediction], index) => {
                              const label = Array.isArray(prediction) ? prediction.join('/') : String(prediction);
                              return (
                                <div 
                                  key={matchId}
                                  className="p-2 rounded-md text-center font-bold text-sm bg-muted"
                                >
                                  Match {index + 1}: {label}
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Display stats */}
                        <div className="flex items-center justify-between text-sm pt-4 border-t">
                          <span className="text-muted-foreground">
                            Mise: {grid.stake} SC
                          </span>
                          <span className="text-muted-foreground">
                            Coût: {grid.cost} SC
                          </span>
                          {grid.status === 'won' && (
                            <span className="text-green-600 font-bold">
                              Gain: {grid.potential_winnings} SC
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    {React.createElement(getStatusIcon(statusFilter), {
                      className: "h-12 w-12 mx-auto text-muted-foreground"
                    })}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune grille trouvée</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === 'all' 
                      ? "Vous n'avez pas encore de grilles" 
                      : `Vous n'avez pas de grilles avec le statut "${statusFilter}"`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PlayerStats;