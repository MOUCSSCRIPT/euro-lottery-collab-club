
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Dices, Trophy, Play, Sparkles, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/premium-football-hero.jpg';

export const HeroSection = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/auth');
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(29,78,216,0.15),transparent_70%)]" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                <span className="block">Le Destin</span>
                <span className="block bg-gradient-gold bg-clip-text text-transparent">
                  Bat Les Cartes
                </span>
              </h1>
              
              <p className="font-inter text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">
                Révolutionnez votre expérience de jeu avec l'intelligence collaborative. 
                <span className="text-gold font-semibold"> Maximisez vos chances, partagez vos gains.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="premium"
                onClick={handlePlayClick}
                className="font-inter text-xl font-bold px-12 py-6 rounded-2xl group animate-float"
              >
                <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                COMMENCER À JOUER
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="font-inter text-lg font-semibold px-8 py-6 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Target className="mr-2 h-5 w-5" />
                Découvrir
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold font-playfair">2M+</div>
                <div className="text-white/70 font-inter">Gains distribués</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold font-playfair">50K+</div>
                <div className="text-white/70 font-inter">Joueurs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold font-playfair">98%</div>
                <div className="text-white/70 font-inter">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:justify-self-end animate-float" style={{ animationDelay: '1s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold rounded-full blur-3xl opacity-30 scale-75" />
              <img 
                src={heroImage} 
                alt="Premium Football" 
                className="relative w-full max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Card className="group p-8 bg-gradient-card backdrop-blur-sm border border-white/20 shadow-elegant hover:shadow-premium transition-all duration-500 hover:-translate-y-2">
            <div className="bg-gradient-to-br from-primary to-primary-glow w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-playfair text-2xl font-bold mb-4 text-primary">Collaboration Intelligente</h3>
            <p className="font-inter text-muted-foreground leading-relaxed">
              Unissez vos forces avec d'autres joueurs passionnés. Notre algorithme élimine les doublons et optimise vos combinaisons.
            </p>
          </Card>

          <Card className="group p-8 bg-gradient-card backdrop-blur-sm border border-white/20 shadow-elegant hover:shadow-premium transition-all duration-500 hover:-translate-y-2">
            <div className="bg-gradient-gold w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <Dices className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-playfair text-2xl font-bold mb-4 text-primary">Optimisation Premium</h3>
            <p className="font-inter text-muted-foreground leading-relaxed">
              Intelligence artificielle avancée pour maximiser vos probabilités de gain avec des stratégies sophistiquées.
            </p>
          </Card>

          <Card className="group p-8 bg-gradient-card backdrop-blur-sm border border-white/20 shadow-elegant hover:shadow-premium transition-all duration-500 hover:-translate-y-2">
            <div className="bg-gradient-to-br from-gold to-gold-light w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-playfair text-2xl font-bold mb-4 text-primary">Gains Équitables</h3>
            <p className="font-inter text-muted-foreground leading-relaxed">
              Distribution automatique et transparente des gains selon votre contribution. Chaque euro investi compte.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
