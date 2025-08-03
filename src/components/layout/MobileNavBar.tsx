import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      href: '/games',
      icon: Gamepad2,
      label: 'Mes Jeux',
      isActive: location.pathname === '/games'
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
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors",
                "min-w-0 flex-1",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};