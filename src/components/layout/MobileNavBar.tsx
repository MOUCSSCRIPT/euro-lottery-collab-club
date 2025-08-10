import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Dice5, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Accueil',
      isActive: location.pathname === '/'
    },
    {
      href: '/games',
      icon: Dice5,
      label: 'Jeux',
      isActive: location.pathname === '/games'
    },
    {
      href: '/groups',
      icon: Users,
      label: 'Groupes',
      isActive: location.pathname === '/groups'
    },
    {
      href: '/panier',
      icon: ShoppingCart,
      label: 'Panier',
      isActive: location.pathname === '/panier'
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
      isActive: location.pathname === '/profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex gap-2 px-4 pt-2 pb-3 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
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
  );
};