
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
                  <Link to="/jouer" className="text-foreground hover:text-blue-600 transition-colors font-medium">
                    Jouer
                  </Link>
                )}
                {userRole !== 'admin' && user && (
                  <LotoFootCartBadge onClick={() => navigate('/panier-validation')} />
                )}
                {userRole !== 'admin' && (
                  <Link to="/stats" className="text-foreground hover:text-blue-600 transition-colors flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Statistiques
                  </Link>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin" className="text-yellow-600 hover:text-yellow-700 transition-colors font-medium">
                      Administration
                    </Link>
                    <Link to="/admin?tab=loto-foot" className="text-foreground hover:text-blue-600 transition-colors">
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
                      className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white"
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
