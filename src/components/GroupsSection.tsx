
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useUserRole } from '@/hooks/useAdminActions';
import { GroupModal } from '@/components/GroupModal';
import { GroupsEmptyState } from '@/components/groups/GroupsEmptyState';

interface GroupsSectionProps {
  selectedGameFilter?: string;
}

export const GroupsSection = ({ selectedGameFilter }: GroupsSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: userRole, isLoading } = useUserRole();
  
  const isAdmin = userRole === 'admin';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-600 mb-2">Accès administrateur requis</h4>
          <p className="text-gray-500">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-2">Gestion des groupes</h3>
        <p className="text-muted-foreground">Administration des équipes et groupes</p>
      </div>
      
      <div className="flex justify-center mb-8">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
        >
          <Users className="mr-2 h-4 w-4" />
          Créer un nouveau groupe
        </Button>
      </div>

      <GroupsEmptyState onNewGroupClick={() => setIsModalOpen(true)} />
      
      <GroupModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};
