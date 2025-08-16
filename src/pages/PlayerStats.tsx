import React from 'react';
import { Header } from '@/components/Header';
import { StatsSection } from '@/components/StatsSection';
import { MobileHeader } from '@/components/layout/MobileHeader';

const PlayerStats = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-20">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader title="Statistiques" />
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
              Mes Statistiques
            </h1>
            <p className="text-muted-foreground">
              Suivez vos performances et gains en détail
            </p>
          </div>
        </div>
      </div>

      <StatsSection />
    </div>
  );
};

export default PlayerStats;