
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Dices, Trophy, Gamepad2, UserPlus } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupBudgetData } from '@/hooks/useGroupBudgetData';
import { useAuth } from '@/contexts/AuthContext';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import type { Database } from '@/integrations/supabase/types';

type Group = Database['public']['Tables']['groups']['Row'];
type GameType = Database['public']['Enums']['game_type'];
type GroupMode = Database['public']['Enums']['group_mode'];

interface GroupCardProps {
  group: Group;
}

const gameTypeLabels = {
  'euromillions': 'EuroMillions'
};

const gameTypeIcons = {
  'euromillions': <Trophy className="h-4 w-4" />
};

export const GroupCard = ({ group }: GroupCardProps) => {
  const navigate = useNavigate();
  const { joinGroup } = useGroups();
  const { user } = useAuth();
  const { members, memberCount, currentUserMember, leaveGroup, isLeaving } = useGroupMembers(group.id);
  const { data: budgetData } = useGroupBudgetData(group.id);

  const handleViewDetails = (groupId: string) => {
    console.log('Navigating to group details:', groupId);
    navigate(`/group/${groupId}`);
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    joinGroup(groupId);
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log('Leaving group:', groupId);
    leaveGroup(groupId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'complete': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'complete': return 'Complet';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getModeColor = (mode: GroupMode) => {
    return mode === 'demo' ? 'bg-purple-500' : 'bg-green-500';
  };

  const getModeText = (mode: GroupMode) => {
    return mode === 'demo' ? 'Démo' : 'Réel';
  };

  // Calcul des données réelles
  const realUserPercentage = budgetData?.userPercentage || 0;
  const realTotalBudget = budgetData?.totalBudgetPlayed || 0;
  const isCreator = user?.id === group.created_by;
  const isMember = !!currentUserMember;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{group.name}</h4>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getStatusColor(group.status)}>
              {getStatusText(group.status)}
            </Badge>
            <Badge className={getModeColor(group.mode)}>
              {getModeText(group.mode)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {gameTypeIcons[group.game_type]}
            {gameTypeLabels[group.game_type]}
          </div>
        </div>
        <div className="text-right">
          {isMember && (
            <>
              <div className="text-2xl font-bold text-blue-600">{Math.round(realUserPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Ma part</div>
            </>
          )}
          {!isMember && (
            <div className="text-sm text-muted-foreground text-right">
              <div className="font-medium">Code: {group.team_code}</div>
              <div>Non membre</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Membres</span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {memberCount}/{group.max_members}
          </span>
        </div>
        
        <Progress value={(memberCount / group.max_members) * 100} className="h-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Grilles
          </span>
          <span className="flex items-center gap-1">
            {gameTypeIcons[group.game_type]}
            {group.grids_count}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Budget total</span>
          <SuerteCoinsDisplay 
            amount={realTotalBudget} 
            size="sm" 
            variant="default"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        {group.next_draw_date && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Prochain tirage</span>
            <span className="text-sm font-medium">
              {new Date(group.next_draw_date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
        <div className="flex space-x-2">
          {!isMember ? (
            <Button 
              variant="outline" 
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => handleJoinGroup(group.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {group.status === 'private' ? 'Rejoindre' : 'Jouer'}
            </Button>
          ) : (
            <>
              {!isCreator && (
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => handleLeaveGroup(group.id)}
                  disabled={isLeaving}
                >
                  Quitter
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleViewDetails(group.id)}
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Jouer
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
