import React from 'react';
import { Header } from '@/components/Header';
import { GroupsSection } from '@/components/GroupsSection';

const Games = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
              Bienvenue dans l'univers Euromillions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Créez ou rejoignez une équipe pour maximiser vos chances de gagner ensemble !
            </p>
          </div>
        </div>
      </div>
      <GroupsSection />
    </div>
  );
};

export default Games;