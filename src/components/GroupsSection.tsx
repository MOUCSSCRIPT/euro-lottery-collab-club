import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Dices, Trophy, Gamepad2 } from 'lucide-react';
import { GroupModal } from './GroupModal';
import { useGroups } from '@/hooks/useGroups';
import type { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];
type GroupMode = Database['public']['Enums']['group_mode'];

const gameTypeLabels: Record<GameType, string> = {
  'euromillions': 'EuroMillions',
  'lotto': 'Lotto',
  'lotto_foot_15': 'Lotto Foot 15'
};

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  'euromillions': <Trophy className="h-4 w-4" />,
  'lotto': <Dices className="h-4 w-4" />,
  'lotto_foot_15': <Gamepad2 className="h-4 w-4" />
};

export const GroupsSection = () => {
  const [showModal, setShowModal] = useState(false);
  const { groups, isLoading } = useGroups();

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

  if (isLoading) {
    return (
      <section id="groups" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos groupes...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="groups" className="py-16 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-2">Mes Groupes</h3>
            <p className="text-muted-foreground">Gérez vos participations collaboratives</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Nouveau groupe
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 mb-2">Aucun groupe pour le moment</h4>
            <p className="text-gray-500 mb-6">Créez votre premier groupe pour commencer à jouer ensemble !</p>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Créer un groupe
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const memberCount = group.group_members?.length || 1;
              const myMembership = group.group_members?.find(m => m.user_id === group.created_by);
              const myPercentage = myMembership?.percentage || 100;
              
              return (
                <Card key={group.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
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
                      <div className="text-2xl font-bold text-blue-600">{myPercentage}%</div>
                      <div className="text-sm text-muted-foreground">Ma part</div>
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
                        {group.game_type === 'lotto_foot_15' ? 'Bulletins' : 'Grilles'}
                      </span>
                      <span className="flex items-center gap-1">
                        {gameTypeIcons[group.game_type]}
                        {group.grids_count}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget total</span>
                      <span className="font-semibold">
                        {group.total_budget}{group.mode === 'demo' ? ' pts' : '€'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    {group.next_draw_date && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Prochain tirage</span>
                        <span className="text-sm font-medium">
                          {new Date(group.next_draw_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    <Button variant="outline" className="w-full">
                      Voir les détails
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <GroupModal open={showModal} onOpenChange={setShowModal} />
      </div>
    </section>
  );
};
