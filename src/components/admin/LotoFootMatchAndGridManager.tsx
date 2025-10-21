import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePublishedGrid } from '@/hooks/usePublishedGrid';

interface LotoFootMatch {
  id: string;
  home_team: string;
  away_team: string;
  match_datetime: string;
  match_position: number;
  draw_date: string;
  status: string;
  result?: string;
}

interface MatchFormData {
  home_team: string;
  away_team: string;
  match_position: number;
  draw_date: string;
  match_datetime: string;
}

interface BulkMatchData {
  draw_date: string;
  match_datetime: string;
  matches: Array<{
    home_team: string;
    away_team: string;
    match_position: number;
  }>;
}

export const LotoFootMatchAndGridManager = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedMatchCount, setSelectedMatchCount] = useState<number>(15);
  const [playDeadline, setPlayDeadline] = useState('');

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam && dateParam !== 'null' && dateParam !== 'undefined') {
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<LotoFootMatch | null>(null);
  const [formData, setFormData] = useState<MatchFormData>({
    home_team: '',
    away_team: '',
    match_position: 1,
    draw_date: selectedDate,
    match_datetime: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
  });
  const [bulkFormData, setBulkFormData] = useState<BulkMatchData>({
    draw_date: selectedDate,
    match_datetime: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    matches: Array.from({ length: selectedMatchCount }, (_, i) => ({
      home_team: '',
      away_team: '',
      match_position: i + 1
    }))
  });

  const queryClient = useQueryClient();

  // Fetch matches for selected date
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['admin-loto-foot-matches', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .select('*')
        .eq('draw_date', selectedDate)
        .order('match_position');

      if (error) throw error;
      return data as LotoFootMatch[];
    },
  });

  // Fetch published grid
  const { data: publishedGrid, isLoading: gridLoading } = usePublishedGrid(selectedDate);

  // Match mutations
  const addMatchMutation = useMutation({
    mutationFn: async (matchData: MatchFormData) => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .insert([{ ...matchData, match_datetime: new Date(matchData.match_datetime).toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
      toast.success('Match ajouté avec succès');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout du match');
      console.error(error);
    },
  });

  const bulkAddMatchesMutation = useMutation({
    mutationFn: async (bulkData: BulkMatchData) => {
      const matchesToInsert = bulkData.matches.map(match => ({
        ...match,
        draw_date: bulkData.draw_date,
        match_datetime: new Date(bulkData.match_datetime).toISOString(),
        status: 'scheduled'
      }));

      const { data, error } = await supabase
        .from('loto_foot_matches')
        .insert(matchesToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
      toast.success(`${data.length} matchs ajoutés avec succès`);
      setIsBulkAddDialogOpen(false);
      resetBulkForm();
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout des matchs');
      console.error(error);
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ id, ...matchData }: MatchFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('loto_foot_matches')
        .update({ ...matchData, match_datetime: new Date(matchData.match_datetime).toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
      toast.success('Match modifié avec succès');
      setEditingMatch(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification du match');
      console.error(error);
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('loto_foot_matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
      toast.success('Match supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression du match');
      console.error(error);
    },
  });

  // Grid mutations
  const createGridMutation = useMutation({
    mutationFn: async (deadline: string) => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .insert({
          draw_date: selectedDate,
          play_deadline: deadline,
          match_count: selectedMatchCount,
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
      setPlayDeadline('');
    },
    onError: (error) => {
      console.error('Error creating grid:', error);
      toast.error('Impossible de créer la grille');
    },
  });

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
      toast.success('Grille publiée ! Elle est maintenant visible par tous les joueurs');
    },
    onError: (error) => {
      console.error('Error publishing grid:', error);
      toast.error('Impossible de publier la grille');
    },
  });

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
      toast.success('Grille dépubliée. Elle n\'est plus visible par les joueurs');
    },
    onError: (error) => {
      console.error('Error unpublishing grid:', error);
      toast.error('Impossible de dépublier la grille');
    },
  });

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
      setPlayDeadline('');
    },
    onError: (error) => {
      console.error('Error updating deadline:', error);
      toast.error('Impossible de mettre à jour la date limite');
    },
  });

  const resetForm = () => {
    const existingPositions = matches?.map(m => m.match_position) || [];
    let nextPosition = 1;
    while (existingPositions.includes(nextPosition) && nextPosition <= selectedMatchCount) {
      nextPosition++;
    }
    
    setFormData({
      home_team: '',
      away_team: '',
      match_position: nextPosition,
      draw_date: selectedDate,
      match_datetime: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      draw_date: selectedDate,
      match_datetime: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      matches: Array.from({ length: selectedMatchCount }, (_, i) => ({
        home_team: '',
        away_team: '',
        match_position: i + 1
      }))
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMatch) {
      updateMatchMutation.mutate({ ...formData, id: editingMatch.id });
    } else {
      addMatchMutation.mutate(formData);
    }
  };

  const startEdit = (match: LotoFootMatch) => {
    setEditingMatch(match);
    setFormData({
      home_team: match.home_team,
      away_team: match.away_team,
      match_position: match.match_position,
      draw_date: match.draw_date,
      match_datetime: format(new Date(match.match_datetime), 'yyyy-MM-dd\'T\'HH:mm')
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMatches = bulkFormData.matches.filter(
      match => match.home_team.trim() && match.away_team.trim()
    );
    
    if (validMatches.length === 0) {
      toast.error('Veuillez renseigner au moins un match complet');
      return;
    }
    
    bulkAddMatchesMutation.mutate({
      ...bulkFormData,
      matches: validMatches
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, draw_date: date }));
    setBulkFormData(prev => ({ ...prev, draw_date: date }));
  };

  const handleCreateGrid = () => {
    if (!playDeadline) {
      toast.error('Veuillez définir une date limite de participation');
      return;
    }
    createGridMutation.mutate(playDeadline);
  };

  const handleUpdateDeadline = () => {
    if (!playDeadline) {
      toast.error('Veuillez définir une nouvelle date limite');
      return;
    }
    updateDeadlineMutation.mutate(playDeadline);
  };

  useEffect(() => {
    setBulkFormData(prev => ({
      ...prev,
      matches: Array.from({ length: selectedMatchCount }, (_, i) => {
        const existingMatch = prev.matches[i];
        return existingMatch || {
          home_team: '',
          away_team: '',
          match_position: i + 1
        };
      })
    }));
  }, [selectedMatchCount]);

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

  const matchesComplete = matches?.length === selectedMatchCount;
  const isLoading = matchesLoading || gridLoading;

  return (
    <div className="space-y-6">
      {/* Étape 1: Sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Étape 1 : Sélection du tirage
          </CardTitle>
          <CardDescription>
            Choisissez la date et le nombre de matchs pour le tirage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-select">Date du tirage :</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="match-count-select">Nombre de matchs :</Label>
              <Select value={selectedMatchCount.toString()} onValueChange={(value) => setSelectedMatchCount(parseInt(value))}>
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

      {/* Étape 2: Configuration des matchs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Étape 2 : Configuration des matchs
                {matches && (
                  <Badge variant={matchesComplete ? "default" : "secondary"}>
                    {matches.length}/{selectedMatchCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {matchesComplete 
                  ? "Tous les matchs sont configurés ✓" 
                  : `Configurez les ${selectedMatchCount} matchs pour cette grille`
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetBulkForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter tous
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter tous les matchs</DialogTitle>
                    <DialogDescription>
                      Renseignez les {selectedMatchCount} matchs pour la date sélectionnée
                    </DialogDescription>
                  </DialogHeader>
                  <BulkMatchForm
                    bulkFormData={bulkFormData}
                    setBulkFormData={setBulkFormData}
                    onSubmit={handleBulkSubmit}
                    isLoading={bulkAddMatchesMutation.isPending}
                    selectedMatchCount={selectedMatchCount}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un match
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau match</DialogTitle>
                    <DialogDescription>
                      Renseignez les informations du match
                    </DialogDescription>
                  </DialogHeader>
                  <MatchForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    isLoading={addMatchMutation.isPending}
                    isEditing={false}
                    selectedMatchCount={selectedMatchCount}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <Card key={match.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        Match {match.match_position}
                      </Badge>
                      <div className="font-medium">
                        {match.home_team} vs {match.away_team}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(match.match_datetime), 'dd/MM HH:mm', { locale: fr })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(match)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMatchMutation.mutate(match.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun match configuré pour cette date</p>
              <p className="text-sm mt-2">
                Configurez {selectedMatchCount} matchs pour cette grille
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Étape 3: Publication */}
      <Card className={!matchesComplete ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Étape 3 : Publication de la grille
              </CardTitle>
              <CardDescription>
                {!matchesComplete 
                  ? "Complétez d'abord tous les matchs pour publier la grille"
                  : "Gérez la publication de la grille"
                }
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!matchesComplete && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                ⚠️ Cette section sera activée une fois que tous les matchs seront configurés ({matches?.length || 0}/{selectedMatchCount})
              </p>
            </div>
          )}

          {matchesComplete && !publishedGrid && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aucune grille créée pour cette date. Définissez une date limite et créez une grille.
              </p>
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite de participation</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={playDeadline}
                  onChange={(e) => setPlayDeadline(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateGrid}
                disabled={createGridMutation.isPending || !playDeadline}
              >
                Créer une nouvelle grille
              </Button>
            </div>
          )}

          {matchesComplete && publishedGrid && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Date limite : <strong>{new Date(publishedGrid.play_deadline).toLocaleString('fr-FR')}</strong>
                </span>
              </div>

              {publishedGrid.status === 'draft' && (
                <>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Cette grille est en mode brouillon et n'est pas visible par les joueurs.
                    </p>
                  </div>
                  <Button 
                    onClick={() => publishGridMutation.mutate()}
                    disabled={publishGridMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publier la grille
                  </Button>
                </>
              )}

              {publishedGrid.status === 'published' && (
                <>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Cette grille est publiée et visible par tous les joueurs.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => unpublishGridMutation.mutate()}
                    disabled={unpublishGridMutation.isPending}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Dépublier
                  </Button>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="update-deadline">Modifier la date limite</Label>
                <div className="flex gap-2">
                  <Input
                    id="update-deadline"
                    type="datetime-local"
                    value={playDeadline}
                    onChange={(e) => setPlayDeadline(e.target.value)}
                  />
                  <Button 
                    onClick={handleUpdateDeadline}
                    disabled={updateDeadlineMutation.isPending || !playDeadline}
                  >
                    Mettre à jour
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le match</DialogTitle>
            <DialogDescription>
              Modifiez les informations du match
            </DialogDescription>
          </DialogHeader>
          <MatchForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={updateMatchMutation.isPending}
            isEditing={true}
            selectedMatchCount={selectedMatchCount}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Form Components
interface MatchFormProps {
  formData: MatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<MatchFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isEditing: boolean;
  selectedMatchCount: number;
}

const MatchForm = ({ formData, setFormData, onSubmit, isLoading, isEditing, selectedMatchCount }: MatchFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="home_team">Équipe domicile</Label>
          <Input
            id="home_team"
            value={formData.home_team}
            onChange={(e) => setFormData(prev => ({ ...prev, home_team: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="away_team">Équipe extérieur</Label>
          <Input
            id="away_team"
            value={formData.away_team}
            onChange={(e) => setFormData(prev => ({ ...prev, away_team: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="match_datetime">Date et heure du match</Label>
        <Input
          id="match_datetime"
          type="datetime-local"
          value={formData.match_datetime}
          onChange={(e) => setFormData(prev => ({ ...prev, match_datetime: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="match_position">Position</Label>
        <Select value={formData.match_position.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, match_position: parseInt(value) }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: selectedMatchCount }, (_, i) => i + 1).map((position) => (
              <SelectItem key={position} value={position.toString()}>
                Match {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
      </Button>
    </form>
  );
};

interface BulkMatchFormProps {
  bulkFormData: BulkMatchData;
  setBulkFormData: React.Dispatch<React.SetStateAction<BulkMatchData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedMatchCount: number;
}

const BulkMatchForm = ({ bulkFormData, setBulkFormData, onSubmit, isLoading, selectedMatchCount }: BulkMatchFormProps) => {
  const updateMatch = (index: number, field: keyof BulkMatchData['matches'][0], value: string | number) => {
    setBulkFormData(prev => ({
      ...prev,
      matches: prev.matches.map((match, i) => 
        i === index ? { ...match, [field]: value } : match
      )
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bulk_draw_date">Date du tirage</Label>
          <Input
            id="bulk_draw_date"
            type="date"
            value={bulkFormData.draw_date}
            onChange={(e) => setBulkFormData(prev => ({ ...prev, draw_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="bulk_match_datetime">Date et heure des matchs</Label>
          <Input
            id="bulk_match_datetime"
            type="datetime-local"
            value={bulkFormData.match_datetime}
            onChange={(e) => setBulkFormData(prev => ({ ...prev, match_datetime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Matchs ({selectedMatchCount})</Label>
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {bulkFormData.matches.map((match, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 items-center p-3 border rounded-lg">
              <div className="text-sm font-medium">
                Match {match.match_position}
              </div>
              <Input
                placeholder="Équipe domicile"
                value={match.home_team}
                onChange={(e) => updateMatch(index, 'home_team', e.target.value)}
              />
              <div className="text-center text-muted-foreground">vs</div>
              <Input
                placeholder="Équipe extérieur"
                value={match.away_team}
                onChange={(e) => updateMatch(index, 'away_team', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Ajout en cours...' : `Ajouter tous les matchs`}
      </Button>
    </form>
  );
};
