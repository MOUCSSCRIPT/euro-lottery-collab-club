import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAllProfiles, useAddCoins, useSetCoins } from '@/hooks/useAdminActions';
import { SuerteCoinsIcon } from '@/components/ui/SuerteCoinsIcon';
import { Plus, Edit, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CoinModalProps {
  profile: any;
  type: 'add' | 'set';
  onAction: ({ userId, amount }: { userId: string; amount: number }) => void;
  isLoading: boolean;
}

const CoinModal = ({ profile, type, onAction, isLoading }: CoinModalProps) => {
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onAction({ userId: profile.user_id, amount: numAmount });
      setAmount('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={type === 'add' ? 'default' : 'outline'} 
          size="sm"
          className="flex items-center gap-1"
        >
          {type === 'add' ? <Plus className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          {type === 'add' ? 'Ajouter' : 'Modifier'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'add' ? 'Ajouter des SuerteCoins' : 'Modifier le solde'}
          </DialogTitle>
          <DialogDescription>
            {type === 'add' 
              ? `Ajouter des SuerteCoins au compte de ${profile.username}` 
              : `Définir le nouveau solde de ${profile.username}`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">
              {type === 'add' ? 'Montant à ajouter' : 'Nouveau solde'}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Entrez le montant"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {type === 'add' ? 'Ajouter' : 'Modifier'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AdminPanel = () => {
  const { data: profiles, isLoading } = useAllProfiles();
  const addCoinsMutation = useAddCoins();
  const setCoinsMutation = useSetCoins();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Panneau d'Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Panneau d'Administration
        </CardTitle>
        <CardDescription>
          Gérez les soldes des joueurs et leurs rôles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3">
            {profiles?.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{profile.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.country && (
                        <Badge variant="outline" className="text-xs">
                          {profile.country}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <SuerteCoinsIcon className="h-4 w-4" />
                    <span>{profile.coins}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <CoinModal
                      profile={profile}
                      type="add"
                      onAction={({ userId, amount }) => addCoinsMutation.mutate({ userId, amount })}
                      isLoading={addCoinsMutation.isPending}
                    />
                    <CoinModal
                      profile={profile}
                      type="set"
                      onAction={({ userId, amount }) => setCoinsMutation.mutate({ userId, amount })}
                      isLoading={setCoinsMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {profiles?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun joueur trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};