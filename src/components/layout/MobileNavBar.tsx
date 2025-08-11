import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Dice5, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoinPurchaseModal } from '@/components/coins/CoinPurchaseModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { useAuth } from '@/contexts/AuthContext';

export const MobileNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Accueil',
      isActive: location.pathname === '/',
      type: 'link' as const,
    },
    {
      href: '/games',
      icon: Dice5,
      label: 'Jeux',
      isActive: location.pathname === '/games',
      type: 'link' as const,
    },
    {
      href: '/groups',
      icon: Users,
      label: 'Groupes',
      isActive: location.pathname === '/groups',
      type: 'link' as const,
    },
    {
      href: '/panier',
      icon: ShoppingCart,
      label: 'Panier',
      isActive: false,
      type: 'action' as const,
      onClick: () => {
        if (user) {
          setShowCoinModal(true);
        } else {
          navigate('/auth');
        }
      },
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
      isActive: location.pathname === '/profile',
      type: 'action' as const,
      onClick: () => {
        if (user) {
          setShowProfileModal(true);
        } else {
          navigate('/auth');
        }
      },
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex gap-2 px-4 pt-2 pb-3 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.type === 'action') {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    "just flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={item.label}
                >
                  <Icon size={24} className="h-6 w-6" />
                  <span className="text-xs font-medium tracking-[0.015em]">{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "just flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
                  item.isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={24} className="h-6 w-6" />
                <span className="text-xs font-medium tracking-[0.015em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <CoinPurchaseModal open={showCoinModal} onOpenChange={setShowCoinModal} />
      <ProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} />
    </>
  );
};