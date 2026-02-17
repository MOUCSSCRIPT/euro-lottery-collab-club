import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePersonalLotoFootGridsWithStatus } from '@/hooks/usePersonalLotoFootGridsWithStatus';
import { GridStatusBadge } from '@/components/grids/GridStatusBadge';
import { Trophy, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type GridStatus = 'all' | 'pending' | 'finished' | 'won' | 'lost';

const PlayerStats = () => {
  const [statusFilter, setStatusFilter] = useState<GridStatus>('all');
  const { data: grids, isLoading } = usePersonalLotoFootGridsWithStatus(statusFilter);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteHistory = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('user_loto_foot_grids')
        .delete()
        .eq('user_id', user.id)
        .neq('status', 'pending');
      if (error) throw error;
      const pendingCount = grids?.filter(g => g.status === 'pending').length || 0;
      if (pendingCount > 0) {
        toast({ title: 'Historique supprimé', description: `${pendingCount} grille(s) en cours conservée(s).` });
      } else {
        toast({ title: 'Historique supprimé', description: 'Toutes vos grilles ont été supprimées.' });
      }
      queryClient.invalidateQueries({ queryKey: ['personal-loto-foot-grids'] });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'historique.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOne = async (gridId: string) => {
    if (!user) return;
    setDeletingId(gridId);
    try {
      const { error } = await supabase
        .from('user_loto_foot_grids')
        .delete()
        .eq('id', gridId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Grille supprimée' });
      queryClient.invalidateQueries({ queryKey: ['personal-loto-foot-grids'] });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer cette grille.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mes grilles</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Supprimer l'historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer tout l'historique ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos grilles Loto Foot seront définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteHistory} disabled={deleting}>
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

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
                  {(() => {
                    // Group grids by group_grid_id
                    const grouped = new Map<string, typeof grids>();
                    grids.forEach((grid: any) => {
                      const key = grid.group_grid_id || grid.id;
                      if (!grouped.has(key)) grouped.set(key, []);
                      grouped.get(key)!.push(grid);
                    });
                    const groupedEntries = Array.from(grouped.values());
                    return (
                      <>
                        <div className="text-sm text-muted-foreground mb-4">
                          {groupedEntries.length} grille{groupedEntries.length > 1 ? 's' : ''} trouvée{groupedEntries.length > 1 ? 's' : ''}
                        </div>
                        {groupedEntries.map((group) => {
                          const grid = group[0];
                          const instanceCount = group.length;
                          return (
                            <Card key={grid.group_grid_id || grid.id}>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex flex-col gap-2">
                                    <span className="text-lg">
                                      {grid.player_name || 'Grille anonyme'}
                                      {instanceCount > 1 && (
                                        <span className="ml-2 text-sm font-medium text-primary">x{instanceCount}</span>
                                      )}
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
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {(() => {
                                    const preds = grid.predictions;
                                    if (Array.isArray(preds)) {
                                      return preds.map((item: any, index: number) => {
                                        const predValues = Array.isArray(item.predictions) ? item.predictions : [item.predictions];
                                        const label = predValues.join('/');
                                        return (
                                          <div key={index} className="p-2 rounded-md text-center font-bold text-sm bg-muted">
                                            Match {item.match_position || index + 1}: {label}
                                          </div>
                                        );
                                      });
                                    }
                                    return Object.entries(preds as Record<string, any>).map(([matchId, prediction], index) => {
                                      const label = Array.isArray(prediction) ? prediction.join('/') : String(prediction);
                                      return (
                                        <div key={matchId} className="p-2 rounded-md text-center font-bold text-sm bg-muted">
                                          Match {index + 1}: {label}
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>

                                <div className="flex items-center justify-between text-sm pt-4 border-t">
                                  <span className="text-muted-foreground">
                                    Mise: {instanceCount > 1 ? `${instanceCount} x 1 SC` : `${grid.stake} SC`}
                                  </span>
                                  <span className="text-muted-foreground">Coût total: {instanceCount} SC</span>
                                  {grid.status === 'won' && (
                                    <span className="text-green-600 font-bold">Gain: {grid.potential_winnings} SC</span>
                                  )}
                                  {grid.status !== 'pending' && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Supprimer cette grille ?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action est irréversible.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => group.forEach(g => handleDeleteOne(g.id))} 
                                            disabled={deletingId === grid.id}
                                          >
                                            {deletingId === grid.id ? 'Suppression...' : 'Supprimer'}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </>
                    );
                  })()}
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
