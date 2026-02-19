import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Dice5, Home, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useAdminActions';
import { useCartStore } from '@/hooks/useCartStore';

export const MobileNavBar = () => {
  const location = useLocation();
  const { data: userRole } = useUserRole();
  const gridCount = useCartStore(state => state.getGridCount());
  
  const navItems = userRole === 'admin' ? [
    { href: '/', icon: Home, label: 'Accueil', isActive: location.pathname === '/' },
    { href: '/admin', icon: Users, label: 'Admin', isActive: location.pathname === '/admin' },
    { href: '/profile', icon: User, label: 'Profil', isActive: location.pathname === '/profile' },
  ] : [
    { href: '/jouer', icon: Dice5, label: 'Jouer', isActive: location.pathname === '/jouer' },
    { href: '/stats', icon: BarChart3, label: 'Stats', isActive: location.pathname === '/stats' },
    { href: '/panier-validation', icon: ShoppingCart, label: 'Panier', isActive: location.pathname === '/panier-validation' },
    { href: '/profile', icon: User, label: 'Profil', isActive: location.pathname === '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden">
      <div className="flex gap-2 px-4 pt-2 pb-3 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCartItem = item.href === '/panier-validation';
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-end gap-1 rounded-full transition-colors',
                item.isActive ? 'text-primary neon-text' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} className="h-6 w-6" />
              <span className="text-xs font-medium tracking-[0.015em]">{item.label}</span>
              {isCartItem && gridCount > 0 && (
                <span className="absolute top-0 right-1/4 transform translate-x-1/2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {gridCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
