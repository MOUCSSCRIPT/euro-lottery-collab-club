import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { GroupsSection } from '@/components/GroupsSection';
import { GameSelector } from '@/components/grids/GameSelector';
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>('euromillions');

  const gameInfo = {
    euromillions: {
      title: "Bienvenue dans l'univers EuroMillions",
      description: "Créez ou rejoignez une équipe pour maximiser vos chances de gagner ensemble !"
    },
    loto_foot: {
      title: "Découvrez le Loto Foot 15",
      description: "Pronostiquez les résultats de 15 matchs et tentez de remporter le jackpot !"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
              {gameInfo[selectedGame].title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {gameInfo[selectedGame].description}
            </p>
          </div>
          
          <div className="mb-8">
            <GameSelector 
              selectedGame={selectedGame}
              onGameSelect={setSelectedGame}
            />
          </div>
        </div>
      </div>
      <GroupsSection selectedGameFilter={selectedGame} />
    </div>
  );
};

export default Games;