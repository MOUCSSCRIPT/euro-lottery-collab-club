import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Dices, Gamepad2, Trophy } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import type { Database } from '@/integrations/supabase/types';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GameType = Database['public']['Enums']['game_type'];
type GroupMode = Database['public']['Enums']['group_mode'];

const gameTypeLabels: Record<GameType, string> = {
  'euromillions': 'EuroMillions',
  'lotto': 'Lotto',
  'lotto_foot_15': 'Lotto Foot 15'
};

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  'euromillions': <Trophy className="h-4 w-4" />,
  'lotto': <Dices className="h-4 w-4" />,
  'lotto_foot_15': <Gamepad2 className="h-4 w-4" />
};

export const GroupModal = ({ open, onOpenChange }: GroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [myContribution, setMyContribution] = useState(25);
  const [description, setDescription] = useState('');
  const [gameType, setGameType] = useState<GameType>('euromillions');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { createGroup, isCreating } = useGroups();

  const calculateStats = () => {
    const estimatedTotal = maxMembers * myContribution;
    const grids = Math.floor(estimatedTotal / (gameType === 'lotto_foot_15' ? 1 : 2));
    const myPercentage = (myContribution / estimatedTotal) * 100;
    
    return { estimatedTotal, grids, myPercentage };
  };

  const { estimatedTotal, grids, myPercentage } = calculateStats();

  const handleCreate = () => {
    if (!groupName.trim()) return;

    createGroup({
      name: groupName,
      description: description || null,
      game_type: gameType,
      mode: isDemoMode ? 'demo' : 'real',
      max_members: maxMembers,
      total_budget: myContribution,
      grids_count: grids,
    });
    
    // Reset form
    setGroupName('');
    setDescription('');
    setMaxMembers(10);
    setMyContribution(25);
    setGameType('euromillions');
    setIsDemoMode(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Créer un nouveau groupe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="groupName">Nom du groupe</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Les Chanceux du Vendredi"
            />
          </div>

          <div className="space-y-4">
            <Label>Type de jeu</Label>
            <Select value={gameType} onValueChange={(value: GameType) => setGameType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(gameTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {gameTypeIcons[value as GameType]}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Mode Démo</Label>
              <p className="text-xs text-muted-foreground">
                Testez sans mise d'argent réel
              </p>
            </div>
            <Switch
              checked={isDemoMode}
              onCheckedChange={setIsDemoMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxMembers">Membres max</Label>
              <Input
                id="maxMembers"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                min={2}
                max={50}
              />
            </div>
            <div>
              <Label htmlFor="myContribution">
                Ma mise ({isDemoMode ? 'virtuelle' : '€'})
              </Label>
              <Input
                id="myContribution"
                type="number"
                value={myContribution}
                onChange={(e) => setMyContribution(Number(e.target.value))}
                min={isDemoMode ? 1 : 5}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre stratégie ou vos préférences..."
              rows={3}
            />
          </div>

          {/* Prévisions */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-blue-900">Prévisions du groupe</h4>
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">
                  Mode Démo
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Budget estimé</span>
                <div className="font-semibold">
                  {estimatedTotal}{isDemoMode ? ' pts' : '€'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {gameType === 'lotto_foot_15' ? 'Bulletins' : 'Grilles'} prévues
                </span>
                <div className="font-semibold flex items-center gap-1">
                  {gameTypeIcons[gameType]}
                  {grids}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Ma part des gains</span>
                <div>
                  <Badge className="bg-blue-600">
                    {myPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!groupName.trim() || isCreating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
            >
              {isCreating ? 'Création...' : 'Créer le groupe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
