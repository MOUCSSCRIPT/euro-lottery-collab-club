
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, Euro, Calendar, Settings, UserPlus } from 'lucide-react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('GroupDetails - fetching group with id:', id);

  // Requête séparée pour le groupe
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      console.log('Fetching group details for id:', id);
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching group:', error);
        throw error;
      }
      console.log('Group fetched successfully:', data);
      return data;
    },
    enabled: !!id,
  });

  // Requête séparée pour les membres du groupe
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', id],
    queryFn: async () => {
      console.log('Fetching group members for group:', id);
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id);

      if (error) {
        console.error('Error fetching group members:', error);
        // Ne pas throw l'erreur pour les membres, juste retourner un tableau vide
        return [];
      }
      console.log('Group members fetched:', data);
      return data || [];
    },
    enabled: !!id,
  });

  const isLoading = groupLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    console.log('Group not found for id:', id);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Groupe non trouvé</h2>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === group.created_by;
  const totalContributions = members?.reduce((sum, member) => sum + (member.contribution || 0), 0) || 0;
  const progressPercentage = group.total_budget ? (totalContributions / group.total_budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header avec navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          {isCreator && (
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Gérer le groupe
            </Button>
          )}
        </div>

        {/* Informations principales du groupe */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{group.name}</CardTitle>
                    <p className="text-muted-foreground">{group.description || 'Aucune description'}</p>
                  </div>
                  <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                    {group.status === 'active' ? 'Actif' : group.status === 'pending' ? 'En attente' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{members?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Membres</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalContributions}{group.mode === 'demo' ? ' pts' : '€'}</div>
                    <div className="text-sm text-muted-foreground">Collecté</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{group.total_budget}{group.mode === 'demo' ? ' pts' : '€'}</div>
                    <div className="text-sm text-muted-foreground">Budget total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                    <div className="text-sm text-muted-foreground">Atteint</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression de la collecte</span>
                    <span>{totalContributions}{group.mode === 'demo' ? ' pts' : '€'} / {group.total_budget}{group.mode === 'demo' ? ' pts' : '€'}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Liste des membres */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Membres du groupe
                  </CardTitle>
                  {isCreator && (
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Inviter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members && members.length > 0 ? (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user_id?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Membre #{member.id.slice(-4)}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {member.user_id === group.created_by && (
                                <Badge variant="outline" className="text-xs">Créateur</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{member.contribution || 0}{group.mode === 'demo' ? ' pts' : '€'}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(member.percentage || 0)}% des gains
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun membre pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600">
                  <Euro className="mr-2 h-4 w-4" />
                  Contribuer
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir les tirages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prochains tirages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Euromillions</p>
                      <p className="text-sm text-muted-foreground">Mardi 18 Juin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">170M€</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Euromillions</p>
                      <p className="text-sm text-muted-foreground">Vendredi 21 Juin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">185M€</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
