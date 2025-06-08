
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Dices } from 'lucide-react';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GroupModal = ({ open, onOpenChange }: GroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [myContribution, setMyContribution] = useState(25);
  const [description, setDescription] = useState('');

  const calculateStats = () => {
    const estimatedTotal = maxMembers * myContribution;
    const grids = Math.floor(estimatedTotal / 2);
    const myPercentage = (myContribution / estimatedTotal) * 100;
    
    return { estimatedTotal, grids, myPercentage };
  };

  const { estimatedTotal, grids, myPercentage } = calculateStats();

  const handleCreate = () => {
    console.log('Creating group:', {
      groupName,
      maxMembers,
      myContribution,
      description
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Créer un nouveau groupe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Nom du groupe</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Les Chanceux du Vendredi"
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
              <Label htmlFor="myContribution">Ma mise (€)</Label>
              <Input
                id="myContribution"
                type="number"
                value={myContribution}
                onChange={(e) => setMyContribution(Number(e.target.value))}
                min={5}
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
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-blue-900 mb-2">Prévisions du groupe</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Budget estimé</span>
                <div className="font-semibold">{estimatedTotal}€</div>
              </div>
              <div>
                <span className="text-muted-foreground">Grilles prévues</span>
                <div className="font-semibold flex items-center gap-1">
                  <Dices className="h-4 w-4" />
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
              disabled={!groupName.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
            >
              Créer le groupe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
