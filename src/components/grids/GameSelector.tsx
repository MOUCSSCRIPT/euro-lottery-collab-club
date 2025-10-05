import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Zap, Trophy } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type GameType = Database['public']['Enums']['game_type'];

interface GameSelectorProps {
  selectedGame: GameType;
  onGameSelect: (gameType: GameType) => void;
}

const gameConfig = {
  loto_foot: {
    icon: Trophy,
    title: 'Loto Foot 15',
    description: 'Pronostiquez les résultats de 15 matchs',
    cost: '1€',
    color: 'green'
  }
};

export const GameSelector = ({ selectedGame, onGameSelect }: GameSelectorProps) => {
  const navigate = useNavigate();

  const handlePlayNow = (gameType: GameType) => {
    // Navigate directly to grids with selected game type
    navigate(`/?game=${gameType}`);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choisissez votre jeu</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(gameConfig).map(([gameType, config]) => {
          const Icon = config.icon;
          const isSelected = selectedGame === gameType;
          
          return (
            <Card 
              key={gameType}
              className={`transition-all duration-300 cursor-pointer hover:scale-105 ${
                isSelected 
                  ? `border-${config.color}-500 bg-${config.color}-50 shadow-lg` 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onGameSelect(gameType as GameType)}
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isSelected 
                    ? `bg-${config.color}-500 text-white` 
                    : `bg-${config.color}-100 text-${config.color}-600`
                }`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayNow(gameType as GameType);
                  }}
                  className={`w-full text-sm ${
                    isSelected 
                      ? `bg-${config.color}-500 hover:bg-${config.color}-600 text-white` 
                      : `bg-${config.color}-100 hover:bg-${config.color}-200 text-${config.color}-700`
                  }`}
                  variant={isSelected ? "default" : "secondary"}
                >
                  Jouer - À partir de {config.cost}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};