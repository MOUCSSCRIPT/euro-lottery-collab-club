
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface GroupsErrorStateProps {
  error: Error;
  onNewGroupClick: () => void;
}

export const GroupsErrorState = ({ error, onNewGroupClick }: GroupsErrorStateProps) => {
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
        
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <h4 className="text-xl font-semibold mb-2">Erreur de chargement</h4>
            <p className="text-sm">{error.message}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </div>
    </section>
  );
};
