import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Globe, Save } from 'lucide-react';
import { SuerteCoinsIcon } from '@/components/ui/SuerteCoinsIcon';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
];

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mandatory?: boolean;
}

export const ProfileModal = ({ open, onOpenChange, mandatory = false }: ProfileModalProps) => {
  const { user } = useAuth();
  const { profile, updateProfile, createProfile } = useProfile();
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setCountry(profile.country || '');
    } else if (user) {
      // Si pas de profil, utiliser l'email comme username par défaut
      setUsername(user.email?.split('@')[0] || '');
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!username.trim()) {
      return;
    }
    
    if (profile) {
      await updateProfile.mutateAsync({ username, country });
    } else {
      await createProfile.mutateAsync({ username, country });
    }
    onOpenChange(false);
  };

  const canSave = username.trim().length > 0;

  const selectedCountry = countries.find(c => c.code === country);

  return (
    <Dialog open={open} onOpenChange={mandatory ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mon Profil
          </DialogTitle>
          <DialogDescription>
            Personnalisez votre profil de joueur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* SuerteCoins Display */}
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-yellow-500 p-3 rounded-full">
                  <SuerteCoinsIcon size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-700">
                    {profile?.coins || 50}
                  </div>
                  <div className="text-sm text-yellow-600">
                    SuerteCoins disponibles
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Pseudo
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre pseudo de joueur"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              required={mandatory}
            />
            {mandatory && !username.trim() && (
              <p className="text-sm text-red-500">Le pseudo est obligatoire</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Pays
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Sélectionner votre pays">
                  {selectedCountry && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span>{selectedCountry.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={updateProfile.isPending || createProfile.isPending || !canSave}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateProfile.isPending || createProfile.isPending ? 'Sauvegarde...' : mandatory ? 'Créer mon profil' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};