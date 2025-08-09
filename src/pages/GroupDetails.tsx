
import { useParams, Navigate } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGrids } from '@/hooks/useGrids';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, Euro, Settings } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { useAuth } from '@/contexts/AuthContext';

import { TeamRequestsModal } from '@/components/teams/TeamRequestsModal';
import { TeamBadge } from '@/components/teams/TeamBadge';
import { HistoryTab } from '@/components/groups/HistoryTab';
import { useGroupCreator } from '@/hooks/useGroupCreator';
import { GridGenerator } from '@/components/grids/GridGenerator';
import { GridGeneratorWithGameSelector } from '@/components/grids/GridGeneratorWithGameSelector';
import { GridDisplay } from '@/components/grids/GridDisplay';
import { useState } from 'react';
import { useTeamRequests } from '@/hooks/useTeamRequests';
import { useToast } from '@/hooks/use-toast';

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { members, memberCount } = useGroupMembers(id);
  const { data: grids, isLoading: gridsLoading } = useGrids(id || '');
  
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const { pendingRequests } = useTeamRequests(id);

  // Always call hooks before any conditional returns
  const group = groups?.find(g => g.id === id);
  const { data: creatorName } = useGroupCreator(group?.created_by);

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (groupsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="hidden md:block"><Header /></div>
        <div className="md:hidden"><MobileHeader title="Détails du groupe" showBack /></div>
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

  if (!group) {
    return <Navigate to="/" replace />;
  }

  const isCreator = group.created_by === user?.id;


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="hidden md:block"><Header /></div>
      <div className="md:hidden"><MobileHeader title={group.name || 'Groupe'} showBack /></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Group Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{group.name}</h1>
                  <TeamBadge 
                    creatorName={creatorName} 
                    isCreator={isCreator}
                    className="text-sm"
                  />
                </div>
                {group.description && (
                  <p className="text-muted-foreground">{group.description}</p>
                )}
              </div>
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
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="grids" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grids">Grilles</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="grids" className="space-y-6">
            <GridGeneratorWithGameSelector group={group} memberCount={memberCount} />
            
            {gridsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <GridDisplay grids={grids || []} gameType={group.game_type} groupId={group.id} />
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
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun membre pour le moment
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Membre {member.user_id === group.created_by ? '(Créateur)' : ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{Math.round(member.percentage)}%</p>
                            <p className="text-sm text-muted-foreground">{member.contribution}€</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab groupId={group.id} />
          </TabsContent>

          {/* Seulement Euromillions maintenant */}
        </Tabs>

        
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
