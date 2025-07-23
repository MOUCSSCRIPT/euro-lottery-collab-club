
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

interface GameInfoCardProps {
  gameType: GameType;
}

export const GameInfoCard = ({ gameType }: GameInfoCardProps) => {
  const getGameInfo = () => {
    switch (gameType) {
      case 'euromillions':
        return {
          description: (
            <>
              <div>• 5 numéros de 1 à 50</div>
              <div>• 2 étoiles de 1 à 12</div>
              <div>• Coût par grille : 2,50€</div>
              <div>• Options : Numéros Chance, Systèmes</div>
            </>
          )
        };
      default:
        return {
          description: <div>• Configuration par défaut</div>
        };
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Type de jeu</h4>
        <Badge variant="secondary" className="capitalize">
          {gameType.replace('_', ' ')}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        {getGameInfo().description}
      </div>
    </div>
  );
};
