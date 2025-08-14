import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useAdminActions';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
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
  const navigate = useNavigate();

  const isAdmin = userRole === 'admin';

  // Rediriger les joueurs vers les grilles de jeux
  useEffect(() => {
    if (userRole !== undefined && !isAdmin) {
      navigate('/');
    }
  }, [userRole, isAdmin, navigate]);

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

  // Les joueurs sont redirigés automatiquement vers les grilles de jeux
  return null;
};