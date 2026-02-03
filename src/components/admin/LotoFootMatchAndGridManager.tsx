import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Eye, EyeOff, Lock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { usePublishedGrid } from '@/hooks/usePublishedGrid';

interface MatchInput {
  home_team: string;
  away_team: string;
}

export const LotoFootMatchAndGridManager = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // State
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [matchCount, setMatchCount] = useState<12 | 14 | 15>(15);
  const [matches, setMatches] = useState<MatchInput[]>([]);
  const [playDeadline, setPlayDeadline] = useState('');
  
  // Initialize matches array when match count changes
  useEffect(() => {
    setMatches(Array.from({ length: matchCount }, () => ({ home_team: '', away_team: '' })));
  }, [matchCount]);

  // Handle date from URL params
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam && dateParam !== 'null' && dateParam !== 'undefined') {
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

  // Fetch existing matches for selected date
  const { data: existingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['admin-loto-foot-matches', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('draw_date', selectedDate)
        .order('match_position');

      if (error) throw error;
      return data;
    },
  });

  // Populate form when existing matches are loaded
  useEffect(() => {
    if (existingMatches && existingMatches.length > 0) {
      const newMatches = Array.from({ length: matchCount }, (_, i) => {
        const existing = existingMatches.find(m => m.match_position === i + 1);
        return {
          home_team: existing?.home_team || '',
          away_team: existing?.away_team || '',
        };
      });
      setMatches(newMatches);
    }
  }, [existingMatches, matchCount]);

  // Fetch published grid
  const { data: publishedGrid, isLoading: gridLoading } = usePublishedGrid(selectedDate);

  // Count filled matches
  const filledMatchesCount = useMemo(() => {
    return matches.filter(m => m.home_team.trim() && m.away_team.trim()).length;
  }, [matches]);

  const allMatchesFilled = filledMatchesCount === matchCount;

  // Save matches mutation
  const saveMatchesMutation = useMutation({
    mutationFn: async () => {
      // First, delete existing matches for this date
      await supabase
        .from('loto_foot_matches')
        .delete()
        .eq('draw_date', selectedDate);

      // Then insert new matches
      const matchesToInsert = matches
        .map((match, index) => ({
          home_team: match.home_team.trim(),
          away_team: match.away_team.trim(),
          match_position: index + 1,
          draw_date: selectedDate,
          match_datetime: new Date(selectedDate).toISOString(),
          status: 'scheduled',
        }))
        .filter(m => m.home_team && m.away_team);

      if (matchesToInsert.length === 0) {
        throw new Error('Aucun match valide à enregistrer');
      }

      const { error } = await supabase
        .from('loto_foot_matches')
        .insert(matchesToInsert);

      if (error) throw error;
      return matchesToInsert.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
      toast.success(`${count} matchs enregistrés`);
    },
    onError: (error) => {
      console.error('Error saving matches:', error);
      toast.error('Erreur lors de l\'enregistrement');
    },
  });

  // Create grid mutation
  const createGridMutation = useMutation({
    mutationFn: async (deadline: string) => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .insert({
          draw_date: selectedDate,
          play_deadline: deadline,
          match_count: matchCount,
          status: 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-grid', selectedDate] });
      toast.success('Grille créée en mode brouillon');
    },
    onError: (error) => {
      console.error('Error creating grid:', error);
      toast.error('Impossible de créer la grille');
    },
  });

  // Publish grid mutation
  const publishGridMutation = useMutation({
    mutationFn: async () => {
      if (!publishedGrid) throw new Error('No grid to publish');
      
      const { error } = await supabase
        .from('loto_foot_published_grids')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', publishedGrid.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-grid', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['next-published-grid'] });
      toast.success('Grille publiée !');
    },
    onError: (error) => {
      console.error('Error publishing grid:', error);
      toast.error('Impossible de publier la grille');
    },
  });

  // Unpublish grid mutation
  const unpublishGridMutation = useMutation({
    mutationFn: async () => {
      if (!publishedGrid) throw new Error('No grid to unpublish');
      
      const { error } = await supabase
        .from('loto_foot_published_grids')
        .update({
          status: 'draft',
          published_at: null,
        })
        .eq('id', publishedGrid.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-grid', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['next-published-grid'] });
      toast.success('Grille dépubliée');
    },
    onError: (error) => {
      console.error('Error unpublishing grid:', error);
      toast.error('Impossible de dépublier');
    },
  });

  // Update deadline mutation
  const updateDeadlineMutation = useMutation({
    mutationFn: async (deadline: string) => {
      if (!publishedGrid) throw new Error('No grid to update');
      
      const { error } = await supabase
        .from('loto_foot_published_grids')
        .update({ play_deadline: deadline })
        .eq('id', publishedGrid.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-grid', selectedDate] });
      toast.success('Date limite mise à jour');
    },
    onError: (error) => {
      console.error('Error updating deadline:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleMatchChange = (index: number, field: 'home_team' | 'away_team', value: string) => {
    setMatches(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateGrid = () => {
    if (!playDeadline) {
      toast.error('Définissez une date limite');
      return;
    }
    createGridMutation.mutate(playDeadline);
  };

  const getStatusBadge = () => {
    if (!publishedGrid) return null;
    
    const isExpired = new Date(publishedGrid.play_deadline) < new Date();
    
    if (publishedGrid.status === 'draft') {
      return <Badge variant="secondary" className="flex items-center gap-1"><EyeOff className="h-3 w-3" />Brouillon</Badge>;
    }
    if (publishedGrid.status === 'published' && !isExpired) {
      return <Badge variant="default" className="flex items-center gap-1"><Eye className="h-3 w-3" />Publiée</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Lock className="h-3 w-3" />Clôturée</Badge>;
    }
    return null;
  };

  const isLoading = matchesLoading || gridLoading;

  return (
    <div className="space-y-6">
      {/* Étape 1: Sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Étape 1 : Sélection
          </CardTitle>
          <CardDescription>Date et nombre de matchs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-select">Date :</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="match-count">Matchs :</Label>
              <Select 
                value={matchCount.toString()} 
                onValueChange={(value) => setMatchCount(parseInt(value) as 12 | 14 | 15)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étape 2: Matchs inline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Étape 2 : Matchs
                <Badge variant={allMatchesFilled ? "default" : "secondary"} className="ml-2">
                  {filledMatchesCount}/{matchCount}
                </Badge>
              </CardTitle>
              <CardDescription>
                {allMatchesFilled ? "Tous les matchs sont remplis ✓" : "Renseignez les équipes"}
              </CardDescription>
            </div>
            <Button 
              onClick={() => saveMatchesMutation.mutate()} 
              disabled={saveMatchesMutation.isPending || filledMatchesCount === 0}
            >
              {saveMatchesMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-8 text-sm text-muted-foreground font-mono">
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  <Input
                    placeholder="Équipe domicile"
                    value={match.home_team}
                    onChange={(e) => handleMatchChange(index, 'home_team', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground text-sm">vs</span>
                  <Input
                    placeholder="Équipe extérieur"
                    value={match.away_team}
                    onChange={(e) => handleMatchChange(index, 'away_team', e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Étape 3: Publication */}
      <Card className={!allMatchesFilled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Étape 3 : Publication
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                {!allMatchesFilled 
                  ? "Complétez tous les matchs d'abord" 
                  : publishedGrid 
                    ? `Deadline: ${format(new Date(publishedGrid.play_deadline), 'dd/MM/yyyy HH:mm')}`
                    : "Créez et publiez la grille"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date limite input */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Label htmlFor="deadline">Date limite :</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={playDeadline || (publishedGrid ? format(new Date(publishedGrid.play_deadline), "yyyy-MM-dd'T'HH:mm") : '')}
                  onChange={(e) => setPlayDeadline(e.target.value)}
                  disabled={!allMatchesFilled}
                  className="flex-1"
                />
              </div>
              
              {publishedGrid && (
                <Button
                  variant="outline"
                  onClick={() => updateDeadlineMutation.mutate(playDeadline)}
                  disabled={!playDeadline || updateDeadlineMutation.isPending || !allMatchesFilled}
                >
                  Modifier deadline
                </Button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {!publishedGrid ? (
                <Button 
                  onClick={handleCreateGrid}
                  disabled={!allMatchesFilled || !playDeadline || createGridMutation.isPending}
                  className="flex-1"
                >
                  {createGridMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer la grille
                </Button>
              ) : publishedGrid.status === 'draft' ? (
                <Button 
                  onClick={() => publishGridMutation.mutate()}
                  disabled={!allMatchesFilled || publishGridMutation.isPending}
                  className="flex-1"
                >
                  {publishGridMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Eye className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => unpublishGridMutation.mutate()}
                  disabled={unpublishGridMutation.isPending}
                  className="flex-1"
                >
                  {unpublishGridMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <EyeOff className="h-4 w-4 mr-2" />
                  Dépublier
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
