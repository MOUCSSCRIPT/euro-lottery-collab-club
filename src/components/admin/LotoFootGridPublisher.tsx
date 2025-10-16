import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePublishedGrid } from '@/hooks/usePublishedGrid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Eye, EyeOff, Lock } from 'lucide-react';

interface LotoFootGridPublisherProps {
  drawDate: string;
  matchCount: number;
}

export const LotoFootGridPublisher = ({ drawDate, matchCount }: LotoFootGridPublisherProps) => {
  const { data: publishedGrid, isLoading } = usePublishedGrid(drawDate);
  const queryClient = useQueryClient();
  const [playDeadline, setPlayDeadline] = useState('');

  const createGridMutation = useMutation({
    mutationFn: async (deadline: string) => {
      const { data, error } = await supabase
        .from('loto_foot_published_grids')
        .insert({
          draw_date: drawDate,
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
      queryClient.invalidateQueries({ queryKey: ['published-grid', drawDate] });
      toast({ title: 'Grille créée en mode brouillon' });
      setPlayDeadline('');
    },
    onError: (error) => {
      console.error('Error creating grid:', error);
      toast({ 
        title: 'Erreur',
        description: 'Impossible de créer la grille',
        variant: 'destructive'
      });
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
      queryClient.invalidateQueries({ queryKey: ['published-grid', drawDate] });
      queryClient.invalidateQueries({ queryKey: ['next-published-grid'] });
      toast({ 
        title: 'Grille publiée !',
        description: 'La grille est maintenant visible par tous les joueurs'
      });
    },
    onError: (error) => {
      console.error('Error publishing grid:', error);
      toast({ 
        title: 'Erreur',
        description: 'Impossible de publier la grille',
        variant: 'destructive'
      });
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
      queryClient.invalidateQueries({ queryKey: ['published-grid', drawDate] });
      queryClient.invalidateQueries({ queryKey: ['next-published-grid'] });
      toast({ 
        title: 'Grille dépubliée',
        description: 'La grille n\'est plus visible par les joueurs'
      });
    },
    onError: (error) => {
      console.error('Error unpublishing grid:', error);
      toast({ 
        title: 'Erreur',
        description: 'Impossible de dépublier la grille',
        variant: 'destructive'
      });
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
      queryClient.invalidateQueries({ queryKey: ['published-grid', drawDate] });
      toast({ title: 'Date limite mise à jour' });
      setPlayDeadline('');
    },
    onError: (error) => {
      console.error('Error updating deadline:', error);
      toast({ 
        title: 'Erreur',
        description: 'Impossible de mettre à jour la date limite',
        variant: 'destructive'
      });
    },
  });

  const handleCreateGrid = () => {
    if (!playDeadline) {
      toast({ 
        title: 'Date limite requise',
        description: 'Veuillez définir une date limite de participation',
        variant: 'destructive'
      });
      return;
    }
    createGridMutation.mutate(playDeadline);
  };

  const handleUpdateDeadline = () => {
    if (!playDeadline) {
      toast({ 
        title: 'Date limite requise',
        description: 'Veuillez définir une nouvelle date limite',
        variant: 'destructive'
      });
      return;
    }
    updateDeadlineMutation.mutate(playDeadline);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publication de la grille - {drawDate}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!publishedGrid ? (
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
        ) : (
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
                <div className="flex gap-2">
                  <Button 
                    onClick={() => publishGridMutation.mutate()}
                    disabled={publishGridMutation.isPending || matchCount === 0}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publier la grille
                  </Button>
                </div>
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

            <div className="space-y-2 pt-4 border-t">
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
  );
};
