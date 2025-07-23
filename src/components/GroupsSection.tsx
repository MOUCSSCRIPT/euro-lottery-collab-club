
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { GroupModal } from './GroupModal';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from './groups/GroupCard';
import { GroupsLoadingState } from './groups/GroupsLoadingState';
import { GroupsErrorState } from './groups/GroupsErrorState';
import { GroupsEmptyState } from './groups/GroupsEmptyState';
import { JoinTeamModal } from './invitations/JoinTeamModal';

export const GroupsSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { groups, isLoading, error } = useGroups();

  console.log('GroupsSection render - isLoading:', isLoading, 'groups:', groups, 'error:', error, 'showModal:', showModal);

  const handleNewGroupClick = () => {
    console.log('New group button clicked, setting showModal to true');
    setShowModal(true);
  };

  const handleJoinGroupClick = () => {
    console.log('Join group button clicked');
    setShowJoinModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    console.log('Modal open change:', open);
    setShowModal(open);
  };

  const handleJoinModalOpenChange = (open: boolean) => {
    console.log('Join modal open change:', open);
    setShowJoinModal(open);
  };

  if (isLoading) {
    return (
      <>
        <GroupsLoadingState onNewGroupClick={handleNewGroupClick} />
        <GroupModal open={showModal} onOpenChange={handleModalOpenChange} />
        <JoinTeamModal open={showJoinModal} onOpenChange={handleJoinModalOpenChange} />
      </>
    );
  }

  if (error) {
    console.error('Groups error:', error);
    return (
      <>
        <GroupsErrorState error={error} onNewGroupClick={handleNewGroupClick} />
        <GroupModal open={showModal} onOpenChange={handleModalOpenChange} />
        <JoinTeamModal open={showJoinModal} onOpenChange={handleJoinModalOpenChange} />
      </>
    );
  }

  return (
    <section id="groups" className="py-16 px-4 bg-white/50">
      <div className="container mx-auto">
        {/* Boutons en haut avec responsive design */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 transition-all duration-1000">
          <Button 
            onClick={handleJoinGroupClick}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none transition-all duration-1000 hover:scale-105"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Rejoindre une TEAM
          </Button>
          <Button 
            onClick={handleNewGroupClick}
            className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white flex-1 sm:flex-none transition-all duration-1000 hover:scale-105"
          >
            <Users className="mr-2 h-4 w-4" />
            Nouvelle TEAM
          </Button>
        </div>

        {/* Titre et description */}
        <div className="text-center sm:text-left mb-8 transition-all duration-1000">
          <h3 className="text-3xl font-bold mb-2">Mes TEAMS</h3>
          <p className="text-muted-foreground">Gérez vos équipes de jeu</p>
        </div>

        {groups.length === 0 ? (
          <GroupsEmptyState onNewGroupClick={handleNewGroupClick} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        <GroupModal open={showModal} onOpenChange={handleModalOpenChange} />
        <JoinTeamModal open={showJoinModal} onOpenChange={handleJoinModalOpenChange} />
      </div>
    </section>
  );
};
