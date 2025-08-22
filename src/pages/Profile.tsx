import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { CoinPurchaseModal } from '@/components/coins/CoinPurchaseModal';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { User, Edit, Plus, History, LogOut, Mail, Phone, MapPin, Lock, Bell, Shield, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/layout/MobileHeader';
const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, createProfile } = useProfile();
  const navigate = useNavigate();
  const displayName = (profile?.username || (user?.email?.split('@')[0] ?? 'Utilisateur')) as string;
  const memberYear = new Date(profile?.created_at ?? (user?.created_at ?? new Date().toISOString())).getFullYear();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCoinPurchase, setShowCoinPurchase] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    country: profile?.country || ''
  });

  const handleSave = async () => {
    try {
      if (profile) {
        await updateProfile.mutateAsync(formData);
      } else {
        await createProfile.mutateAsync(formData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="hidden md:block"><Header /></div>
        <div className="md:hidden"><MobileHeader title="Profil" /></div>
        <div className="container mx-auto px-4 pt-8 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Vous devez être connecté pour voir votre profil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="hidden md:block"><Header /></div>
      <div className="md:hidden"><MobileHeader title="Profil" /></div>
      {/* Mobile profile layout */}
      <div className="md:hidden">
        <div className="flex p-4">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={(user as any)?.user_metadata?.avatar_url} alt={`Avatar de ${displayName}`} />
                <AvatarFallback>{displayName.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center justify-center">
                <p className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{displayName}</p>
                <p className="text-muted-foreground text-base leading-normal text-center">Membre depuis {memberYear}</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-foreground text-lg font-bold tracking-[-0.015em] px-4 pb-2 pt-4">Informations personnelles</h3>
        <button type="button" onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2 w-full text-left">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-12">
            <Edit className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-foreground text-base font-medium leading-normal line-clamp-1">Modifier le profil</p>
            <p className="text-muted-foreground text-sm leading-normal line-clamp-2">Nom d'utilisateur, pays</p>
          </div>
        </button>
        
        {isEditing && (
          <div className="px-4 py-6 bg-muted/30 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile-username" className="text-sm font-medium">Nom d'utilisateur</Label>
              <Input 
                id="mobile-username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Votre nom d'utilisateur"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-country" className="text-sm font-medium">Pays</Label>
              <Input 
                id="mobile-country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Votre pays"
                className="bg-background"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave}
                disabled={updateProfile.isPending || createProfile.isPending}
                className="flex-1"
                size="sm"
              >
                Sauvegarder
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-12">
            <Mail className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-foreground text-base font-medium leading-normal line-clamp-1">Adresse e-mail</p>
            <p className="text-muted-foreground text-sm leading-normal line-clamp-2">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-12">
            <User className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-foreground text-base font-medium leading-normal line-clamp-1">Nom d'utilisateur</p>
            <p className="text-muted-foreground text-sm leading-normal line-clamp-2">{profile?.username || 'Non renseigné'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-12">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-foreground text-base font-medium leading-normal line-clamp-1">Pays</p>
            <p className="text-muted-foreground text-sm leading-normal line-clamp-2">{profile?.country || 'Non renseigné'}</p>
          </div>
        </div>

        <h3 className="text-foreground text-lg font-bold tracking-[-0.015em] px-4 pb-2 pt-4">Paramètres du compte</h3>
        <button type="button" onClick={() => toast({ title: 'Bientôt disponible', description: 'La modification du mot de passe arrive bientôt.' })} className="flex items-center gap-4 bg-background px-4 min-h-14 w-full text-left">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-foreground text-base leading-normal flex-1 truncate">Modifier le mot de passe</p>
        </button>
        <button type="button" onClick={() => toast({ title: 'Bientôt disponible', description: 'Les notifications seront bientôt configurables.' })} className="flex items-center gap-4 bg-background px-4 min-h-14 w-full text-left">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
            <Bell className="h-6 w-6" />
          </div>
          <p className="text-foreground text-base leading-normal flex-1 truncate">Notifications</p>
        </button>
        <button type="button" onClick={() => toast({ title: 'Bientôt disponible', description: 'Paramètres de confidentialité à venir.' })} className="flex items-center gap-4 bg-background px-4 min-h-14 w-full text-left">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-foreground text-base leading-normal flex-1 truncate">Confidentialité</p>
        </button>
        <button type="button" onClick={() => toast({ title: 'Aide', description: 'Contactez-nous si besoin.' })} className="flex items-center gap-4 bg-background px-4 min-h-14 w-full text-left">
          <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
            <HelpCircle className="h-6 w-6" />
          </div>
          <p className="text-foreground text-base leading-normal flex-1 truncate">Aide et assistance</p>
        </button>
        
        <h3 className="text-foreground text-lg font-bold tracking-[-0.015em] px-4 pb-2 pt-4">Déconnexion</h3>
        <button type="button" onClick={handleSignOut} className="flex items-center gap-4 bg-background px-4 min-h-14 w-full text-left">
          <div className="text-destructive flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
            <LogOut className="h-6 w-6" />
          </div>
          <p className="text-destructive text-base leading-normal flex-1 truncate">Se déconnecter</p>
        </button>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-20 hidden md:block">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles et vos SuerteCoins</p>
          </div>

          {/* SuerteCoins Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mes SuerteCoins</span>
                <Button 
                  onClick={() => setShowCoinPurchase(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Acheter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <SuerteCoinsDisplay 
                  amount={profile?.coins || 0} 
                  size="lg" 
                  className="justify-center text-2xl font-bold p-4 bg-white/50 dark:bg-black/20 rounded-lg border-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Utilisez vos coins pour participer aux tirages
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Informations personnelles</span>
                {!isEditing && (
                  <Button 
                    onClick={() => {
                      setFormData({
                        username: profile?.username || '',
                        country: profile?.country || ''
                      });
                      setIsEditing(true);
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input 
                  id="username"
                  value={isEditing ? formData.username : (profile?.username || 'Non renseigné')}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input 
                  id="country"
                  value={isEditing ? formData.country : (profile?.country || 'Non renseigné')}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Votre pays"
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfile.isPending || createProfile.isPending}
                    className="flex-1"
                  >
                    Sauvegarder
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions du compte</CardTitle>
              <CardDescription>
                Gérez votre compte et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/games')}
              >
                <History className="w-4 h-4 mr-2" />
                Mes groupes et tirages
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>

          {/* Achievement System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-yellow-600 text-lg">🏆</span>
                </div>
                Mes Récompenses
              </CardTitle>
              <CardDescription>Débloquez des badges en jouant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-semibold text-sm">Premier Pas</p>
                  <p className="text-xs text-muted-foreground">Compte créé</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="text-3xl mb-2 opacity-30">🎲</div>
                  <p className="font-semibold text-sm opacity-50">Premier Jeu</p>
                  <p className="text-xs text-muted-foreground opacity-50">Jouez votre première grille</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="text-3xl mb-2 opacity-30">💰</div>
                  <p className="font-semibold text-sm opacity-50">Premier Gain</p>
                  <p className="text-xs text-muted-foreground opacity-50">Gagnez votre premier lot</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="text-3xl mb-2 opacity-30">👥</div>
                  <p className="font-semibold text-sm opacity-50">Social</p>
                  <p className="text-xs text-muted-foreground opacity-50">Rejoignez un groupe</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">🎉 Prochain objectif: Jouez votre première grille pour débloquer le badge "Premier Jeu"</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques détaillées</CardTitle>
                <CardDescription>Votre activité sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile.coins}</p>
                    <p className="text-sm text-muted-foreground">SuerteCoins</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-muted-foreground">Groupes rejoints</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-muted-foreground">Gains totaux</p>
                  </div>
                </div>
                
                {/* Extended Statistics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Statistiques de jeu</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">0</p>
                      <p className="text-xs text-muted-foreground">Grilles jouées</p>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                      <p className="text-xl font-bold text-indigo-600">0</p>
                      <p className="text-xs text-muted-foreground">Tirages participés</p>
                    </div>
                    <div className="text-center p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                      <p className="text-xl font-bold text-pink-600">0%</p>
                      <p className="text-xs text-muted-foreground">Taux de gain</p>
                    </div>
                    <div className="text-center p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                      <p className="text-xl font-bold text-teal-600">0</p>
                      <p className="text-xs text-muted-foreground">Numéros favoris</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-xl font-bold text-orange-600">0h</p>
                      <p className="text-xs text-muted-foreground">Temps total</p>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                      <p className="text-xl font-bold text-cyan-600">0</p>
                      <p className="text-xs text-muted-foreground">Série actuelle</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Analyses</CardTitle>
              <CardDescription>Analyses détaillées de vos habitudes de jeu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-600">📊</span>
                    Jeu de la semaine
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">Aucune activité cette semaine</p>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Meilleur mois</h4>
                    <p className="text-2xl font-bold text-green-600">-</p>
                    <p className="text-xs text-muted-foreground">Aucune donnée</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-300">Numéros chanceux</h4>
                    <p className="text-2xl font-bold text-yellow-600">-</p>
                    <p className="text-xs text-muted-foreground">Pas encore de données</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
                Réseau Social
              </CardTitle>
              <CardDescription>Connectez-vous avec d'autres joueurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Amis</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Invitations</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Parrainage</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Bientôt disponible', description: 'Le système d\'amis arrive bientôt.' })}>
                    <User className="w-4 h-4 mr-2" />
                    Trouver des amis
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Parrainage', description: 'Invitez vos amis et gagnez des coins !' })}>
                    <span className="w-4 h-4 mr-2">🎁</span>
                    Programme de parrainage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences de jeu</CardTitle>
              <CardDescription>Configurez vos préférences par défaut</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications de gains</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications de gains</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Bientôt disponible', description: 'Cette fonctionnalité arrive bientôt.' })}>
                  Activer
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de tirage</Label>
                  <p className="text-sm text-muted-foreground">Être averti avant les tirages</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Bientôt disponible', description: 'Cette fonctionnalité arrive bientôt.' })}>
                  Configurer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Historique d'activité</CardTitle>
              <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Création du profil</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile?.created_at || '').toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Plus d'activités à venir...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support & Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Aide</CardTitle>
              <CardDescription>Besoin d'assistance ? Nous sommes là pour vous</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: 'Support', description: 'Notre équipe vous contactera bientôt.' })}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Centre d'aide
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: 'Contact', description: 'Vous pouvez nous contacter à support@suerte.com' })}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CoinPurchaseModal 
        open={showCoinPurchase}
        onOpenChange={setShowCoinPurchase}
      />
    </div>
  );
};

export default Profile;