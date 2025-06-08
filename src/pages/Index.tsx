
import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { GroupsSection } from '@/components/GroupsSection';
import { StatsSection } from '@/components/StatsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header />
      <HeroSection />
      <GroupsSection />
      <StatsSection />
    </div>
  );
};

export default Index;
