
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Users, Menu, BarChart3 } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { useNavigate, Link } from 'react-router-dom';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useAdminActions';
import { CoinPurchaseModal } from '@/components/coins/CoinPurchaseModal';
import { LotoFootCartBadge } from '@/components/cart/LotoFootCartBadge';

export const Header = () => {
  const { isMobile } = useMobile();
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const { data: userRole } = useUserRole();
  const navigate = useNavigate();
  const [showCoinPurchaseModal, setShowCoinPurchaseModal] = useState(false);

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="bg-primary p-2 rounded-xl neon-glow">
              <Dices className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Connexion
                    </Button>
                  )
                )}
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              {user && profile && userRole !== 'admin' && (
                <SuerteCoinsDisplay 
                  amount={profile.coins} 
                  size="sm" 
                  variant="default"
                  clickable
                  onClick={() => setShowCoinPurchaseModal(true)}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end space-y-2">
              <nav className="flex items-center space-x-4">
                {userRole !== 'admin' && user && (
                  <Link to="/jouer" className="text-foreground hover:text-primary transition-colors font-medium">
                    Jouer
                  </Link>
                )}
                {userRole !== 'admin' && user && (
                  <LotoFootCartBadge onClick={() => navigate('/panier-validation')} />
                )}
                {userRole !== 'admin' && (
                  <Link to="/stats" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Statistiques
                  </Link>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors font-medium">
                      Administration
                    </Link>
                    <Link to="/admin?tab=loto-foot" className="text-foreground hover:text-primary transition-colors">
                      Loto Foot
                    </Link>
                  </>
                )}
                {user ? (
                  <UserMenu />
                ) : (
                  !loading && (
                    <Button 
                      onClick={handleAuthClick}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Se connecter
                    </Button>
                  )
                )}
              </nav>
              {user && profile && userRole !== 'admin' && (
                <SuerteCoinsDisplay 
                  amount={profile.coins} 
                  size="sm" 
                  variant="default"
                  clickable
                  onClick={() => setShowCoinPurchaseModal(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      <CoinPurchaseModal
        open={showCoinPurchaseModal}
        onOpenChange={setShowCoinPurchaseModal}
      />
    </header>
  );
};
