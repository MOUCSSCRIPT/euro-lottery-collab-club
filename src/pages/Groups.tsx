import React from 'react';
import { Header } from '@/components/Header';
import { GroupsSection } from '@/components/GroupsSection';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Groups = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-20">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader title="Groupes" />
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
              Mes Groupes
            </h1>
            <p className="text-muted-foreground">
              Gérez vos équipes, rejoignez des groupes et suivez vos grilles
            </p>
          </div>
        </div>
      </div>

      <GroupsSection />
    </div>
  );
};

export default Groups;