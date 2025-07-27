import React, { useState } from 'react';
import { GameSelector } from './GameSelector';
import { GridGenerator } from './GridGenerator';
import { LotoFootGenerator } from '../loto-foot/LotoFootGenerator';
import { LotoFootOptimizedDisplay } from '../loto-foot/LotoFootOptimizedDisplay';
import { Tables } from '@/integrations/supabase/types';
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];

interface GridGeneratorWithGameSelectorProps {
  group: Tables<'groups'>;
  memberCount: number;
}

export const GridGeneratorWithGameSelector = ({ 
  group, 
  memberCount 
}: GridGeneratorWithGameSelectorProps) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(group.game_type || 'euromillions');

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
  };

  // If the group already has a game type set, use that specific generator
  if (group.game_type === 'loto_foot') {
    return (
      <div className="space-y-6">
        <LotoFootGenerator group={group} memberCount={memberCount} />
        <LotoFootOptimizedDisplay groupId={group.id} />
      </div>
    );
  }

  if (group.game_type === 'euromillions') {
    return <GridGenerator group={group} memberCount={memberCount} />;
  }

  // For new groups without a game type, show selector
  return (
    <div className="space-y-6">
      <GameSelector 
        selectedGame={selectedGame}
        onGameSelect={handleGameSelect}
      />

      {selectedGame === 'euromillions' && (
        <GridGenerator group={group} memberCount={memberCount} />
      )}

      {selectedGame === 'loto_foot' && (
        <div className="space-y-6">
          <LotoFootGenerator group={group} memberCount={memberCount} />
          <LotoFootOptimizedDisplay groupId={group.id} />
        </div>
      )}
    </div>
  );
};