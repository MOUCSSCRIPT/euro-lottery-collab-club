import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllProfiles, useAddCoins, useSetCoins } from '@/hooks/useAdminActions';
import { SuerteCoinsIcon } from '@/components/ui/SuerteCoinsIcon';
import { LotoFootMatchManager } from './LotoFootMatchManager';
import { Plus, Edit, Crown, Users, Calendar } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'loto-foot') {
      setActiveTab('loto-foot');
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', value);
    setSearchParams(newSearchParams);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Panneau d'Administration
          </CardTitle>
          <CardDescription>
            Gérez les jeux, les joueurs et leurs soldes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Joueurs
              </TabsTrigger>
              <TabsTrigger value="loto-foot" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Loto Foot
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="space-y-4 mt-6">
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
            </TabsContent>
            
            <TabsContent value="loto-foot" className="mt-6">
              <LotoFootMatchManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};