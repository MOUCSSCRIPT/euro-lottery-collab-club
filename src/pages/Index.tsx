
import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { GridGeneratorWithGameSelector } from '@/components/grids/GridGeneratorWithGameSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { MobileHeader } from '@/components/layout/MobileHeader';

type GameType = Database['public']['Enums']['game_type'];

const Index = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const gameParam = searchParams.get('game') as GameType;

  // Create a default public group for direct grid access
  const defaultGroup = {
    id: 'public-group',
    name: 'Groupe Public',
    description: 'Groupe ouvert à tous les joueurs',
    game_type: gameParam || ('euromillions' as GameType),
    mode: 'real' as const,
    max_members: 100,
    total_budget: 0,
    grids_count: 0,
    status: 'public' as const,
    next_draw_date: null,
    created_by: user?.id || 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team_code: null,
    play_deadline: null
  } as const;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <Header />
        <HeroSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-20">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader title="Grilles de Jeu" />
      </div>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
              Générer vos grilles
            </h1>
            <p className="text-muted-foreground">
              Accès direct aux grilles - Jouez en groupe ouvert
            </p>
          </div>
          
          <GridGeneratorWithGameSelector 
            group={defaultGroup} 
            memberCount={1} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
