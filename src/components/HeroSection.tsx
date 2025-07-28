
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Dices, Trophy, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/auth');
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
            Le Destin Bat Les Cartes 
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Augmentez vos chances de gagner en créant des groupes collaboratifs. 
            Évitez les doublons, partagez les coûts et les gains proportionnellement.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handlePlayClick}
              className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white px-16 py-6 text-xl font-semibold transform transition-all duration-700 hover:scale-105 hover:shadow-2xl animate-pulse rounded-full"
            >
              <Play className="mr-3 h-6 w-6" />
              JOUER
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Collaboration intelligente</h3>
            <p className="text-muted-foreground">
              Regroupez vos mises pour jouer plus de grilles et éviter les numéros en double
            </p>
          </Card>

          <Card className="p-6 border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Dices className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Optimisation automatique</h3>
            <p className="text-muted-foreground">
              Notre algorithme répartit automatiquement les numéros pour maximiser vos chances
            </p>
          </Card>

          <Card className="p-6 border-yellow-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Gains proportionnels</h3>
            <p className="text-muted-foreground">
              Chaque membre reçoit sa part des gains selon sa contribution au groupe
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
