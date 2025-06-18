
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface GroupsEmptyStateProps {
  onNewGroupClick: () => void;
}

export const GroupsEmptyState = ({ onNewGroupClick }: GroupsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h4 className="text-xl font-semibold text-gray-600 mb-2">Aucun groupe pour le moment</h4>
      <p className="text-gray-500 mb-6">Créez votre premier groupe pour commencer à jouer ensemble !</p>
      <Button 
        onClick={onNewGroupClick}
        className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
      >
        <Users className="mr-2 h-4 w-4" />
        Créer un groupe
      </Button>
    </div>
  );
};
