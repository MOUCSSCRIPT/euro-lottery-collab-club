
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Users, Menu } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { useNavigate } from 'react-router-dom';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useProfile } from '@/hooks/useProfile';

export const Header = () => {
  const { isMobile } = useMobile();
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="bg-gradient-to-r from-blue-600 to-yellow-500 p-2 rounded-xl">
              <Dices className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                SUERTE+
              </h1>
              <p className="text-sm text-muted-foreground">Gagnez ensemble</p>
            </div>
          </div>
          
          {isMobile ? (
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                {user ? (
                  <UserMenu />
                ) : (
                  !loading && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleAuthClick}
                      className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
                    >
                      Connexion
                    </Button>
                  )
                )}
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              {user && profile && (
                <SuerteCoinsDisplay 
                  amount={profile.coins} 
                  size="sm" 
                  variant="default"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end space-y-2">
              <nav className="flex items-center space-x-6">
                <a href="#groups" className="text-foreground hover:text-blue-600 transition-colors">
                  Mes Groupes
                </a>
                <a href="#stats" className="text-foreground hover:text-blue-600 transition-colors">
                  Statistiques
                </a>
                {user ? (
                  <UserMenu />
                ) : (
                  !loading && (
                    <Button 
                      onClick={handleAuthClick}
                      className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
                    >
                      Se connecter
                    </Button>
                  )
                )}
              </nav>
              {user && profile && (
                <SuerteCoinsDisplay 
                  amount={profile.coins} 
                  size="sm" 
                  variant="default"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
