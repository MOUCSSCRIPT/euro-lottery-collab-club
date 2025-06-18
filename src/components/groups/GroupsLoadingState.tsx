
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface GroupsLoadingStateProps {
  onNewGroupClick: () => void;
}

export const GroupsLoadingState = ({ onNewGroupClick }: GroupsLoadingStateProps) => {
  return (
    <section id="groups" className="py-16 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-2">Mes Groupes</h3>
            <p className="text-muted-foreground">Gérez vos participations collaboratives</p>
          </div>
          <Button 
            onClick={onNewGroupClick}
            className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Nouveau groupe
          </Button>
        </div>
        
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos groupes...</p>
        </div>
      </div>
    </section>
  );
};
