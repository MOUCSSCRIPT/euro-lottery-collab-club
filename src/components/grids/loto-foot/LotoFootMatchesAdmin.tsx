import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useLotoFootMatches, CreateLotoFootMatchData, UpdateLotoFootMatchData } from '@/hooks/useLotoFootMatches';

interface LotoFootMatchesAdminProps {
  groupId: string;
  isAdmin: boolean;
}

export const LotoFootMatchesAdmin = ({ groupId, isAdmin }: LotoFootMatchesAdminProps) => {
  const { matches, createMatch, updateMatch, deleteMatch } = useLotoFootMatches(groupId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    match_position: 1,
    team_home: '',
    team_away: '',
    match_date: ''
  });

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMatch) {
      const updateData: UpdateLotoFootMatchData = {
        team_home: formData.team_home,
        team_away: formData.team_away,
        match_date: formData.match_date || undefined
      };
      
      await updateMatch.mutateAsync({ id: editingMatch, data: updateData });
      setEditingMatch(null);
    } else {
      const createData: CreateLotoFootMatchData = {
        group_id: groupId,
        match_position: formData.match_position,
        team_home: formData.team_home,
        team_away: formData.team_away,
        match_date: formData.match_date || undefined
      };
      
      await createMatch.mutateAsync(createData);
    }
    
    setFormData({ match_position: 1, team_home: '', team_away: '', match_date: '' });
    setIsDialogOpen(false);
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match.id);
    setFormData({
      match_position: match.match_position,
      team_home: match.team_home,
      team_away: match.team_away,
      match_date: match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      await deleteMatch.mutateAsync(id);
    }
  };

  const handleAddNew = () => {
    setEditingMatch(null);
    setFormData({ match_position: 1, team_home: '', team_away: '', match_date: '' });
    setIsDialogOpen(true);
  };

  // Créer un array des 15 positions avec les matchs configurés
  const matchPositions = Array.from({ length: 15 }, (_, index) => {
    const position = index + 1;
    const match = matches.find(m => m.match_position === position);
    return { position, match };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des matchs Loto Foot 15
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMatch ? 'Modifier le match' : 'Ajouter un match'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="match_position">Position du match (1-15)</Label>
                  <Input
                    id="match_position"
                    type="number"
                    min="1"
                    max="15"
                    value={formData.match_position}
                    onChange={(e) => setFormData({ ...formData, match_position: parseInt(e.target.value) })}
                    disabled={!!editingMatch}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team_home">Équipe domicile</Label>
                  <Input
                    id="team_home"
                    value={formData.team_home}
                    onChange={(e) => setFormData({ ...formData, team_home: e.target.value })}
                    placeholder="Ex: Paris Saint-Germain"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team_away">Équipe extérieur</Label>
                  <Input
                    id="team_away"
                    value={formData.team_away}
                    onChange={(e) => setFormData({ ...formData, team_away: e.target.value })}
                    placeholder="Ex: Olympique de Marseille"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="match_date">Date et heure du match (optionnel)</Label>
                  <Input
                    id="match_date"
                    type="datetime-local"
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingMatch ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {matchPositions.map(({ position, match }) => (
            <div key={position} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold w-8">#{position}</span>
                {match ? (
                  <div>
                    <span className="font-medium">{match.team_home} vs {match.team_away}</span>
                    {match.match_date && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Match {position} - Non configuré</span>
                )}
              </div>
              {match && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(match)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(match.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};