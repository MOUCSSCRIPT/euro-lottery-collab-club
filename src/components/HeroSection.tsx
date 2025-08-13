
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

      

     

        </div>
      </div>
    </section>
  );
};
