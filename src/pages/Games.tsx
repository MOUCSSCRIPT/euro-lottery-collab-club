import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { GameSelector } from '@/components/grids/GameSelector';
import { Database } from '@/integrations/supabase/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Settings } from 'lucide-react';
type GameType = Database['public']['Enums']['game_type'];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>('euromillions');

  const gameInfo = {
    euromillions: {
      title: "Bienvenue dans l'univers EuroMillions",
      description: "Créez vos grilles et tentez de remporter le jackpot !"
    },
    loto_foot: {
      title: "Découvrez le Loto Foot 15",
      description: "Pronostiquez les résultats de 15 matchs et tentez de remporter le jackpot !"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-20">
      <div className="hidden md:block"><Header /></div>
      <div className="md:hidden"><MobileHeader title="Jeux" rightIcon={Settings} /></div>
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
    </div>
  );
};

export default Games;