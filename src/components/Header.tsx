
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Users, Menu } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-yellow-500 p-2 rounded-xl">
              <Dices className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                EuroCollab
              </h1>
              <p className="text-sm text-muted-foreground">Gagnez ensemble</p>
            </div>
          </Link>
          
          {isMobile ? (
            <div className="flex items-center space-x-2">
              {user ? (
                <UserMenu />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="text-blue-600"
                >
                  Connexion
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <nav className="flex items-center space-x-6">
              {user && (
                <>
                  <a href="#groups" className="text-foreground hover:text-blue-600 transition-colors">
                    Mes Groupes
                  </a>
                  <a href="#stats" className="text-foreground hover:text-blue-600 transition-colors">
                    Statistiques
                  </a>
                </>
              )}
              {user ? (
                <UserMenu />
              ) : (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
                  onClick={() => navigate('/auth')}
                >
                  Se connecter
                </Button>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
