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
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LotoFootGridPublisher } from './LotoFootGridPublisher';

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

export const LotoFootMatchManager = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedMatchCount, setSelectedMatchCount] = useState<number>(15);

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
  const { data: matches, isLoading } = useQuery({
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


  // Add match mutation
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

  // Bulk add matches mutation
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

  // Update match mutation
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

  // Delete match mutation
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

  const resetForm = () => {
    // Find the next available position
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
    
    // Vérifier que tous les matchs ont au moins les équipes renseignées
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

  // Update bulk form when match count changes
  React.useEffect(() => {
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


  return (
    <div className="space-y-6">
      <LotoFootGridPublisher drawDate={selectedDate} matchCount={matches?.length || 0} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestion des matchs Loto Foot
              </CardTitle>
              <CardDescription>
                Créez et gérez les grilles de matchs pour le Loto Foot
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetBulkForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter tous les matchs
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter tous les matchs</DialogTitle>
                    <DialogDescription>
                      Renseignez tous les matchs pour la date sélectionnée
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
          <div className="space-y-4">
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

            {isLoading ? (
              <div className="text-center py-8">Chargement des matchs...</div>
            ) : matches && matches.length >= selectedMatchCount ? (
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
                <p>
                  {matches && matches.length > 0 
                    ? `${matches.length}/${selectedMatchCount} matchs configurés` 
                    : 'Aucun match configuré pour cette date'
                  }
                </p>
                <p className="text-sm mt-2">
                  {matches && matches.length > 0
                    ? `Il manque ${selectedMatchCount - matches.length} matchs pour compléter la grille`
                    : `Configurez ${selectedMatchCount} matchs pour cette grille`
                  }
                </p>
              </div>
            )}
          </div>
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

interface MatchFormProps {
  formData: MatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<MatchFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isEditing: boolean;
  selectedMatchCount: number;
}

interface BulkMatchFormProps {
  bulkFormData: BulkMatchData;
  setBulkFormData: React.Dispatch<React.SetStateAction<BulkMatchData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
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