import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProfileModal } from '../profile/ProfileModal';
import { useProfile } from '@/hooks/useProfile';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur suerte+ !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Utilisateur';
  const userInitials = displayName.substring(0, 2).toUpperCase();

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem className="flex-col items-start p-3">
            <div className="flex items-center gap-2 w-full">
              <div className="font-medium">{displayName}</div>
              {profile && (
                <SuerteCoinsDisplay 
                  amount={profile.coins} 
                  size="sm" 
                  variant="default"
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Mon Profil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal} 
      />
    </>
  );
};