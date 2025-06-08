
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Dices } from 'lucide-react';
import { GroupModal } from './GroupModal';

interface Group {
  id: number;
  name: string;
  members: number;
  maxMembers: number;
  totalBudget: number;
  myContribution: number;
  myPercentage: number;
  grids: number;
  status: 'active' | 'complete' | 'pending';
  nextDraw: string;
}

const mockGroups: Group[] = [
  {
    id: 1,
    name: "Les Chanceux du Vendredi",
    members: 8,
    maxMembers: 10,
    totalBudget: 250,
    myContribution: 30,
    myPercentage: 12,
    grids: 125,
    status: 'active',
    nextDraw: '2024-06-11'
  },
  {
    id: 2,
    name: "Super Syndicate",
    members: 15,
    maxMembers: 15,
    totalBudget: 450,
    myContribution: 25,
    myPercentage: 5.6,
    grids: 225,
    status: 'complete',
    nextDraw: '2024-06-11'
  },
  {
    id: 3,
    name: "Amis de la Fortune",
    members: 5,
    maxMembers: 12,
    totalBudget: 120,
    myContribution: 40,
    myPercentage: 33.3,
    grids: 60,
    status: 'pending',
    nextDraw: '2024-06-14'
  }
];

export const GroupsSection = () => {
  const [showModal, setShowModal] = useState(false);

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{group.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(group.status)}>
                      {getStatusText(group.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{group.myPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Ma part</div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Membres</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.members}/{group.maxMembers}
                  </span>
                </div>
                
                <Progress value={(group.members / group.maxMembers) * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Grilles</span>
                  <span className="flex items-center gap-1">
                    <Dices className="h-4 w-4" />
                    {group.grids}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget total</span>
                  <span className="font-semibold">{group.totalBudget}€</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ma contribution</span>
                  <span className="font-semibold text-blue-600">{group.myContribution}€</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Prochain tirage</span>
                  <span className="text-sm font-medium">{new Date(group.nextDraw).toLocaleDateString('fr-FR')}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Voir les détails
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <GroupModal open={showModal} onOpenChange={setShowModal} />
      </div>
    </section>
  );
};
