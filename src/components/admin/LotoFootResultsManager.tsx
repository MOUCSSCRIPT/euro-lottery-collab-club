import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trophy, Loader2, CheckCircle } from 'lucide-react';

export const LotoFootResultsManager = () => {
  const [drawDate, setDrawDate] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: matches, isLoading } = useLotoFootMatches(drawDate);

  const handleResultChange = (matchId: string, result: string) => {
    setResults(prev => ({
      ...prev,
      [matchId]: result
    }));
  };

  const handleSubmitResults = async () => {
    if (!drawDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une date de tirage',
        variant: 'destructive',
      });
      return;
    }

    if (!matches || matches.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucun match trouvé pour cette date',
        variant: 'destructive',
      });
      return;
    }

    const resultsCount = Object.keys(results).length;
    if (resultsCount < 15) {
      toast({
        title: 'Erreur',
        description: `Veuillez saisir les 15 résultats (${resultsCount}/15)`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update match results in database
      for (const matchId of Object.keys(results)) {
        await supabase
          .from('loto_foot_matches')
          .update({
            result: results[matchId],
            status: 'finished'
          })
          .eq('id', matchId);
      }

      // Call the function to calculate results
      const { error: calcError } = await supabase.rpc('calculate_loto_foot_results', {
        p_draw_date: drawDate,
        p_winning_results: results
      });

      if (calcError) throw calcError;

      toast({
        title: 'Résultats enregistrés !',
        description: 'Les grilles ont été analysées et les gagnants calculés',
      });

      // Reset form
      setResults({});
      setDrawDate('');
    } catch (error) {
      console.error('Error submitting results:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les résultats',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Saisir les résultats gagnants
        </CardTitle>
        <CardDescription>
          Entrez les résultats officiels pour calculer automatiquement les gagnants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Draw date selector */}
        <div className="space-y-2">
          <Label htmlFor="draw-date">Date du tirage</Label>
          <Input
            id="draw-date"
            type="date"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
          />
        </div>

        {/* Matches results */}
        {drawDate && (
          <>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chargement des matchs...</p>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Résultats saisis : {Object.keys(results).length}/15
                </p>
                
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun match trouvé pour cette date
              </div>
            )}

            {matches && matches.length > 0 && (
              <Button
                onClick={handleSubmitResults}
                disabled={isProcessing || Object.keys(results).length < 15}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Valider et calculer les gagnants
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
