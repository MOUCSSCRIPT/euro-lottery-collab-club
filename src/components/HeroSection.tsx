
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/jouer');
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden grid-pattern">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circle - primary/pink */}
        <svg className="absolute top-10 left-[10%] w-32 h-32 opacity-[0.07] animate-float" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="hsl(340, 85%, 55%)" strokeWidth="2" fill="none" />
        </svg>
        {/* Triangle - accent/gold */}
        <svg className="absolute top-20 right-[15%] w-28 h-28 opacity-[0.07] animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" stroke="hsl(45, 90%, 55%)" strokeWidth="2" fill="none" />
        </svg>
        {/* Square - teal */}
        <svg className="absolute bottom-10 left-[25%] w-24 h-24 opacity-[0.07] animate-float" style={{ animationDelay: '4s' }} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" stroke="hsl(175, 70%, 45%)" strokeWidth="2" fill="none" />
        </svg>
        {/* Extra circle */}
        <svg className="absolute bottom-20 right-[10%] w-20 h-20 opacity-[0.05] animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="hsl(340, 85%, 55%)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-foreground to-accent bg-clip-text text-transparent neon-text">
            Le Destin Bat Les Cartes
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Augmentez vos chances de gagner ensemble. 
            Évitez les doublons.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handlePlayClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-16 py-6 text-xl font-semibold transform transition-all duration-700 hover:scale-105 animate-neon-pulse rounded-full neon-glow"
            >
              <Play className="mr-3 h-6 w-6" />
              JOUER
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
