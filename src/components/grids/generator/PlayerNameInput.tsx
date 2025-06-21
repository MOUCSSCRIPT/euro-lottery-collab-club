
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlayerNameInputProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

export const PlayerNameInput = ({ playerName, onPlayerNameChange }: PlayerNameInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="player-name">Votre nom</Label>
      <Input
        id="player-name"
        type="text"
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
        placeholder="Votre nom dans le groupe"
      />
    </div>
  );
};
