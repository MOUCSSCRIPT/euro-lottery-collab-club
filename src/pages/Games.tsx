import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { GameSelector } from '@/components/grids/GameSelector';
import { EuromillionsQuickPlay } from '@/components/euromillions/EuromillionsQuickPlay';
import { LotoFootQuickPlay } from '@/components/loto-foot/LotoFootQuickPlay';
import { Database } from '@/integrations/supabase/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Settings } from 'lucide-react';

type GameType = Database['public']['Enums']['game_type'];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>('euromillions');

  const gameInfo = {
    euromillions: {
      title: "Jeu Rapide EuroMillions",
      description: "Créez vos grilles EuroMillions en quelques clics"
    },
    loto_foot: {
      title: "Jeu Rapide Loto Foot 15",
      description: "Faites vos pronostics sur 15 matchs de football"
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

          {/* Quick Play Components */}
          {selectedGame === 'euromillions' && <EuromillionsQuickPlay />}
          {selectedGame === 'loto_foot' && <LotoFootQuickPlay />}
        </div>
      </div>
    </div>
  );
};

export default Games;