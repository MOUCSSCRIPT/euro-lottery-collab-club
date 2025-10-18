import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublishedGrids, useClosePublishedGrid } from '@/hooks/usePublishedGrids';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trophy, Loader2, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const LotoFootPublishedGridsManager = () => {
  const { data: grids, isLoading } = usePublishedGrids();
  const [selectedGrid, setSelectedGrid] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const closeGridMutation = useClosePublishedGrid();

  const selectedGridData = grids?.find(g => g.id === selectedGrid);
  const { data: matches } = useLotoFootMatches(selectedGridData?.draw_date || '');

  const handleResultChange = (matchId: string, result: string) => {
    setResults(prev => ({
      ...prev,
      [matchId]: result
    }));
  };

  const handleValidateResults = async () => {
    if (!selectedGridData || !matches) return;

    const resultsCount = Object.keys(results).length;
    if (resultsCount < 15) {
      toast({
        title: 'Résultats incomplets',
        description: `Veuillez saisir les 15 résultats (${resultsCount}/15)`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update match results
      for (const matchId of Object.keys(results)) {
        await supabase
          .from('loto_foot_matches')
          .update({
            result: results[matchId],
            status: 'finished'
          })
          .eq('id', matchId);
      }

      // Calculate results
      const { error: calcError } = await supabase.rpc('calculate_loto_foot_results', {
        p_draw_date: selectedGridData.draw_date,
        p_winning_results: results
      });

      if (calcError) throw calcError;

      // Close the grid
      await closeGridMutation.mutateAsync(selectedGridData.id);

      toast({
        title: 'Résultats validés !',
        description: 'Les grilles ont été analysées et les gagnants calculés',
      });

      setSelectedGrid(null);
      setResults({});
    } catch (error) {
      console.error('Error validating results:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider les résultats',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chargement des grilles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Grilles publiées à valider
          </CardTitle>
          <CardDescription>
            Validez les résultats pour chaque grille publiée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {grids && grids.length > 0 ? (
            grids.map((grid) => (
              <div key={grid.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        Tirage du {format(new Date(grid.draw_date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Date limite : {format(new Date(grid.play_deadline), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {grid.match_count} matchs
                      </Badge>
                      <Badge variant="secondary">
                        Publié
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedGrid(grid.id);
                      setResults({});
                    }}
                    size="sm"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Valider Résultat
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-medium">Aucune grille à valider</p>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les grilles publiées ont été validées
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for result validation */}
      <Dialog open={!!selectedGrid} onOpenChange={(open) => !open && setSelectedGrid(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Saisir les résultats
            </DialogTitle>
            <DialogDescription>
              {selectedGridData && (
                <>Tirage du {format(new Date(selectedGridData.draw_date), 'dd MMMM yyyy', { locale: fr })}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {matches && matches.length > 0 ? (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Résultats saisis : {Object.keys(results).length}/15
                  </span>
                </div>

                <div className="space-y-3">
                  {matches.map((match) => (
                    <div key={match.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Match {match.match_position}
                        </span>
                        {results[match.id] && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {match.home_team} vs {match.away_team}
                      </div>
                      <div className="flex gap-2">
                        {['1', 'X', '2'].map((result) => (
                          <Button
                            key={result}
                            variant="outline"
                            size="sm"
                            onClick={() => handleResultChange(match.id, result)}
                            className={`flex-1 font-bold ${
                              results[match.id] === result
                                ? result === '1'
                                  ? 'bg-prediction-1 text-prediction-1-foreground border-prediction-1'
                                  : result === 'X'
                                  ? 'bg-prediction-x text-prediction-x-foreground border-prediction-x'
                                  : 'bg-prediction-2 text-prediction-2-foreground border-prediction-2'
                                : ''
                            }`}
                          >
                            {result}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleValidateResults}
                  disabled={isProcessing || Object.keys(results).length < 15}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Validation en cours...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-5 w-5" />
                      Valider et calculer les gagnants
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun match trouvé pour cette grille
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
