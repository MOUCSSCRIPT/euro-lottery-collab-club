import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useAdminActions';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/hooks/useGroups';
import { useGroupBudgetData } from '@/hooks/useGroupBudgetData';
import { useUserGroups } from '@/hooks/useUserGroups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, TrendingUp, Percent, Coins } from 'lucide-react';
import { GroupModal } from '@/components/GroupModal';
import { GroupCard } from '@/components/groups/GroupCard';

interface GroupsSectionProps {
  selectedGameFilter?: string;
}

export const GroupsSection = ({ selectedGameFilter }: GroupsSectionProps) => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const { groups } = useGroups();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = userRole === 'admin';

  // Filter groups based on game type if filter is provided
  const filteredGroups = selectedGameFilter && groups
    ? groups.filter(group => group.game_type === selectedGameFilter)
    : groups;

  if (isAdmin) {
    return (
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Gestion des groupes</h2>
            <p className="text-muted-foreground">Créez et gérez les groupes de jeu</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un nouveau groupe
          </Button>
        </div>

        {filteredGroups && filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {selectedGameFilter ? `Aucun groupe ${selectedGameFilter}` : 'Aucun groupe créé'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {selectedGameFilter 
                  ? `Commencez par créer votre premier groupe ${selectedGameFilter}` 
                  : 'Commencez par créer votre premier groupe'
                }
              </p>
            </CardContent>
          </Card>
        )}

        <GroupModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    );
  }

  // Vue joueur - Statistiques personnelles
  return <PlayerStatsSection selectedGameFilter={selectedGameFilter} />;
};

const PlayerStatsSection = ({ selectedGameFilter }: { selectedGameFilter?: string }) => {
  const { user } = useAuth();
  const { data: userGroups } = useUserGroups();

  const filteredUserGroups = selectedGameFilter 
    ? userGroups?.filter(group => group.game_type === selectedGameFilter)
    : userGroups;

  // Calculer les statistiques globales de l'utilisateur
  const totalGroups = filteredUserGroups?.length || 0;
  const totalBudgetPlayed = 0; // À calculer avec les grilles
  const averagePercentage = 0; // À calculer

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Mes Statistiques</h2>
        <p className="text-muted-foreground">
          Suivez votre participation et vos performances
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {selectedGameFilter ? `${selectedGameFilter} uniquement` : 'Tous jeux confondus'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget investi</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgetPlayed}€</div>
            <p className="text-xs text-muted-foreground">
              Total de vos participations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation moyenne</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              De votre budget par groupe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des groupes avec participation */}
      {filteredUserGroups && filteredUserGroups.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vos participations</h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredUserGroups.map((group) => (
              <PlayerGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Aucune participation</h3>
            <p className="text-muted-foreground">
              Vous ne participez à aucun groupe pour le moment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const PlayerGroupCard = ({ group }: { group: any }) => {
  const { user } = useAuth();
  const { data: budgetData } = useGroupBudgetData(group.id);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{group.name}</h4>
            <Badge variant="secondary">{group.game_type}</Badge>
            <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
              {group.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Votre budget</p>
              <p className="font-medium">{budgetData?.userBudgetPlayed || 0}€</p>
            </div>
            <div>
              <p className="text-muted-foreground">Votre part</p>
              <p className="font-medium">{budgetData?.userPercentage?.toFixed(1) || 0}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget total</p>
              <p className="font-medium">{budgetData?.totalBudgetPlayed || 0}€</p>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = `/group/${group.id}`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Jouer
        </Button>
      </div>
    </Card>
  );
};