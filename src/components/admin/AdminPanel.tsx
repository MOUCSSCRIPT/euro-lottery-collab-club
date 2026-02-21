import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllProfiles, useAddCoins, useSetCoins, useCreatePlayer, useDeletePlayer } from '@/hooks/useAdminActions';
import { SuerteCoinsIcon } from '@/components/ui/SuerteCoinsIcon';
import { LotoFootMatchAndGridManager } from './LotoFootMatchAndGridManager';
import { LotoFootPublishedGridsManager } from './LotoFootPublishedGridsManager';
import { LotoFootAdminDashboard } from './LotoFootAdminDashboard';
import { Plus, Edit, Crown, Users, Calendar, Trophy, BarChart3, Trash2, Copy, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

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
        <Button variant={type === 'add' ? 'default' : 'outline'} size="sm" className="flex items-center gap-1">
          {type === 'add' ? <Plus className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          {type === 'add' ? 'Ajouter' : 'Modifier'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'add' ? 'Ajouter des SuerteCoins' : 'Modifier le solde'}</DialogTitle>
          <DialogDescription>
            {type === 'add' ? `Ajouter des SuerteCoins au compte de ${profile.username}` : `Définir le nouveau solde de ${profile.username}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">{type === 'add' ? 'Montant à ajouter' : 'Nouveau solde'}</Label>
            <Input id="amount" type="number" step="0.1" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Entrez le montant" required />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">{type === 'add' ? 'Ajouter' : 'Modifier'}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CreatePlayerModal = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [result, setResult] = useState<{ password: string; email: string } | null>(null);
  const createPlayer = useCreatePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createPlayer.mutateAsync({
        username: username.trim(),
        email: email.trim() || undefined,
        country: country.trim() || undefined,
      });
      setResult({ password: data.password, email: data.email });
    } catch {
      // error handled by hook
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUsername('');
    setEmail('');
    setCountry('');
    setResult(null);
  };

  const copyPassword = () => {
    if (result) {
      navigator.clipboard.writeText(result.password);
      toast({ title: 'Copié', description: 'Mot de passe copié dans le presse-papier.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un joueur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un joueur</DialogTitle>
          <DialogDescription>Le joueur recevra un mot de passe provisoire à modifier à la première connexion.</DialogDescription>
        </DialogHeader>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-username">Pseudo *</Label>
              <Input id="player-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: Jean" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-email">Email (optionnel)</Label>
              <Input id="player-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@example.com" />
              <p className="text-xs text-muted-foreground">Si vide, un email interne sera généré.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-country">Pays (optionnel)</Label>
              <Input id="player-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex: France" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createPlayer.isPending} className="flex-1">
                {createPlayer.isPending ? 'Création...' : 'Créer le joueur'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>Annuler</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <p className="font-medium text-green-800 dark:text-green-200">✅ Joueur créé avec succès !</p>
              <div className="space-y-2">
                <p className="text-sm"><strong>Email :</strong> {result.email}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm"><strong>Mot de passe :</strong> {result.password}</p>
                  <Button size="sm" variant="outline" onClick={copyPassword}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Communiquez ces identifiants au joueur. Il devra changer son mot de passe à la première connexion.</p>
            </div>
            <Button onClick={handleClose} className="w-full">Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const AdminPanel = () => {
  const { data: profiles, isLoading } = useAllProfiles();
  const addCoinsMutation = useAddCoins();
  const setCoinsMutation = useSetCoins();
  const deletePlayer = useDeletePlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('loto-foot');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['players', 'loto-foot', 'results', 'stats'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
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
          <CardDescription>Administration — Gestion Loto Foot et Joueurs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Joueurs
              </TabsTrigger>
              <TabsTrigger value="loto-foot" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Matchs
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Résultats
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="space-y-4 mt-6">
              <div className="flex justify-end">
                <CreatePlayerModal />
              </div>
              <div className="grid gap-3">
                {profiles?.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{profile.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.country && (
                            <Badge variant="outline" className="text-xs">{profile.country}</Badge>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer {profile.username} ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le compte et toutes les données du joueur seront supprimés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePlayer.mutate(profile.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {profiles?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucun joueur trouvé</div>
              )}
            </TabsContent>
            
            <TabsContent value="loto-foot" className="mt-6">
              <LotoFootMatchAndGridManager />
            </TabsContent>
            
            <TabsContent value="results" className="mt-6">
              <LotoFootPublishedGridsManager />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-6">
              <LotoFootAdminDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};