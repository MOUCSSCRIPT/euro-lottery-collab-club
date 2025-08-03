import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { CoinPurchaseModal } from '@/components/coins/CoinPurchaseModal';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { User, Edit, Plus, History, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, createProfile } = useProfile();
  const navigate = useNavigate();
  
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
        <Header />
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
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-20">
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

          {/* Profile Stats */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
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
              </CardContent>
            </Card>
          )}
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