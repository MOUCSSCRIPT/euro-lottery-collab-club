
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Users, Trophy } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-yellow-500 p-2 rounded-xl">
              <Dices className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                EuroCollab
              </h1>
              <p className="text-sm text-muted-foreground">Gagnez ensemble</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#groups" className="text-foreground hover:text-blue-600 transition-colors">
              Mes Groupes
            </a>
            <a href="#stats" className="text-foreground hover:text-blue-600 transition-colors">
              Statistiques
            </a>
            <Button className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white">
              Se connecter
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
