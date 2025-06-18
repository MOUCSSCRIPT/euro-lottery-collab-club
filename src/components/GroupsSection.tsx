
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { GroupModal } from './GroupModal';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from './groups/GroupCard';
import { GroupsLoadingState } from './groups/GroupsLoadingState';
import { GroupsErrorState } from './groups/GroupsErrorState';
import { GroupsEmptyState } from './groups/GroupsEmptyState';

export const GroupsSection = () => {
  const [showModal, setShowModal] = useState(false);
  const { groups, isLoading, error } = useGroups();

  console.log('GroupsSection render - isLoading:', isLoading, 'groups:', groups, 'error:', error, 'showModal:', showModal);

  const handleNewGroupClick = () => {
    console.log('New group button clicked, setting showModal to true');
    setShowModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    console.log('Modal open change:', open);
    setShowModal(open);
  };

  if (isLoading) {
    return (
      <>
        <GroupsLoadingState onNewGroupClick={handleNewGroupClick} />
        <GroupModal open={showModal} onOpenChange={handleModalOpenChange} />
      </>
    );
  }

  if (error) {
    console.error('Groups error:', error);
    return (
      <>
        <GroupsErrorState error={error} onNewGroupClick={handleNewGroupClick} />
        <GroupModal open={showModal} onOpenChange={handleModalOpenChange} />
      </>
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
            onClick={handleNewGroupClick}
            className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Nouveau groupe
          </Button>
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
      </div>
    </section>
  );
};
