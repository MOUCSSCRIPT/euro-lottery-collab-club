
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Users, Dices, Gamepad2, Trophy, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { getNextPlayDeadline, formatDeadline } from '@/utils/playDeadlines';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGameType?: GameType;
}

type GameType = Database['public']['Enums']['game_type'];
type GroupMode = Database['public']['Enums']['group_mode'];

const gameTypeLabels = {
  'euromillions': 'EuroMillions',
  'loto_foot': 'Loto Foot 15'
};

const gameTypeIcons = {
  'euromillions': <Trophy className="h-4 w-4" />,
  'loto_foot': <Gamepad2 className="h-4 w-4" />
};

export const GroupModal = ({ open, onOpenChange, defaultGameType }: GroupModalProps) => {
  console.log('GroupModal render - open:', open);
  
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [myContribution, setMyContribution] = useState(25);
  const [description, setDescription] = useState('');
  const [gameType, setGameType] = useState<GameType>(defaultGameType || 'euromillions');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const [playDeadline, setPlayDeadline] = useState<Date>(() => getNextPlayDeadline('euromillions'));
  const [deadlineTime, setDeadlineTime] = useState('20:15');
  
  const { createGroup, isCreating } = useGroups();

  const calculateStats = () => {
    const estimatedTotal = maxMembers * myContribution;
    const grids = Math.floor(estimatedTotal / 2);
    const myPercentage = (myContribution / estimatedTotal) * 100;
    
    return { estimatedTotal, grids, myPercentage };
  };

  const { estimatedTotal, grids, myPercentage } = calculateStats();

  const handleCreate = () => {
    console.log('handleCreate called - groupName:', groupName);
    
    if (!groupName.trim()) {
      console.log('Group name is empty, returning');
      return;
    }

    console.log('Creating group with data:', {
      name: groupName,
      description: description || null,
      game_type: gameType,
      mode: isDemoMode ? 'demo' : 'real',
      max_members: maxMembers,
      total_budget: myContribution,
      grids_count: grids,
    });

    // Combine date and time for deadline
    const [hours, minutes] = deadlineTime.split(':').map(Number);
    const deadline = new Date(playDeadline);
    deadline.setHours(hours, minutes, 0, 0);

    createGroup({
      name: groupName,
      description: description || null,
      game_type: gameType,
      mode: isDemoMode ? 'demo' : 'real',
      max_members: maxMembers,
      total_budget: myContribution,
      grids_count: grids,
      status: isPrivateGroup ? 'private' : 'public',
      play_deadline: deadline.toISOString(),
    });
    
    // Reset form
    setGroupName('');
    setDescription('');
    setMaxMembers(10);
    setMyContribution(25);
    setGameType('euromillions');
    setIsDemoMode(false);
    setIsPrivateGroup(false);
    setPlayDeadline(getNextPlayDeadline('euromillions'));
    setDeadlineTime('20:15');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Créer une nouvelle TEAM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="groupName">Nom de la TEAM</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Les Champions du Vendredi"
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

          <div className="space-y-4">
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

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Groupe Privé</Label>
                <p className="text-xs text-muted-foreground">
                  Les nouveaux membres doivent demander l'accès
                </p>
              </div>
              <Switch
                checked={isPrivateGroup}
                onCheckedChange={setIsPrivateGroup}
              />
            </div>
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
                min={2.5}
                step={0.5}
              />
            </div>
          </div>

          <div>
            <Label>Date limite de jeu</Label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !playDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {playDeadline ? format(playDeadline, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={playDeadline}
                    onSelect={(date) => date && setPlayDeadline(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  (heure limite pour jouer)
                </span>
              </div>
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

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-blue-900">Prévisions de la TEAM</h4>
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
                  Grilles prévues
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
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Cancel button clicked');
                onOpenChange(false);
              }} 
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => {
                console.log('Create button clicked');
                handleCreate();
              }}
              disabled={!groupName.trim() || isCreating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
            >
              {isCreating ? 'Création...' : 'Créer la TEAM'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
