
import { useParams, Navigate } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useGrids } from '@/hooks/useGrids';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, Calendar, Euro, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InviteModal } from '@/components/invitations/InviteModal';
import { TeamRequestsModal } from '@/components/teams/TeamRequestsModal';
import { TeamBadge } from '@/components/teams/TeamBadge';
import { GridGenerator } from '@/components/grids/GridGenerator';
import { GridDisplay } from '@/components/grids/GridDisplay';
import { LotoFootMatchesAdmin } from '@/components/grids/loto-foot/LotoFootMatchesAdmin';
import { useState } from 'react';
import { useTeamRequests } from '@/hooks/useTeamRequests';

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { data: grids, isLoading: gridsLoading } = useGrids(id || '');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const { pendingRequests } = useTeamRequests(id);

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (groupsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const group = groups?.find(g => g.id === id);

  if (!group) {
    return <Navigate to="/" replace />;
  }

  const isCreator = group.created_by === user?.id;
  // For demo purposes, we'll assume 3 members including the creator
  const memberCount = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Group Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <TeamBadge 
                  teamName={group.name} 
                  isCreator={isCreator}
                  className="text-sm"
                />
              </div>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>
            {isCreator && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowRequestsModal(true)}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 relative"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Demandes
                  {pendingRequests.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
                    >
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{memberCount}</div>
                  <div className="text-sm text-muted-foreground">Membres</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Euro className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{group.total_budget}€</div>
                  <div className="text-sm text-muted-foreground">Budget</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{grids?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Grilles</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={group.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {group.status}
                </Badge>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="grids" className="space-y-6">
          <TabsList className={`grid w-full ${group.game_type === 'lotto_foot_15' && isCreator ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="grids">Grilles</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            {group.game_type === 'lotto_foot_15' && isCreator && (
              <TabsTrigger value="matches">Matchs</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="grids" className="space-y-6">
            {isCreator && (
              <GridGenerator group={group} memberCount={memberCount} />
            )}
            
            {gridsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <GridDisplay grids={grids || []} gameType={group.game_type} />
            )}
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Membres de la TEAM</CardTitle>
                <CardDescription>
                  Gérez les membres et leurs contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Fonctionnalité en cours de développement
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des tirages</CardTitle>
                <CardDescription>
                  Consultez les résultats des tirages précédents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Aucun historique disponible pour le moment
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {group.game_type === 'lotto_foot_15' && isCreator && (
            <TabsContent value="matches">
              <LotoFootMatchesAdmin 
                groupId={group.id}
                isAdmin={isCreator}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Modals */}
        <InviteModal 
          open={showInviteModal} 
          onOpenChange={setShowInviteModal}
          groupId={group.id}
          groupName={group.name}
        />
        
        <TeamRequestsModal
          open={showRequestsModal}
          onOpenChange={setShowRequestsModal}
          groupId={group.id}
        />
      </div>
    </div>
  );
};

export default GroupDetails;
