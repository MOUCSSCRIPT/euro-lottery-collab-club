
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dices, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type GridMode = 'auto' | 'manual';

interface GridModeSelectorProps {
  mode: GridMode;
  onModeChange: (mode: GridMode) => void;
}

export const GridModeSelector = ({ mode, onModeChange }: GridModeSelectorProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">Comment jouer ?</h3>
          <p className="text-muted-foreground">
            Choisissez votre style de jeu
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            variant="ghost"
            className={cn(
              "h-auto p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105",
              mode === 'auto' 
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl scale-105" 
                : "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200"
            )}
            onClick={() => onModeChange('auto')}
          >
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              mode === 'auto' ? "bg-white/20 animate-pulse" : "bg-blue-200"
            )}>
              <Dices className={cn(
                "h-8 w-8 transition-all duration-300",
                mode === 'auto' ? "text-white" : "text-blue-600"
              )} />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg mb-1">Automatique</div>
              <div className={cn(
                "text-sm",
                mode === 'auto' ? "text-white/90" : "text-blue-700"
              )}>
                Laissez la chance décider
              </div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "h-auto p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105",
              mode === 'manual' 
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl scale-105" 
                : "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200"
            )}
            onClick={() => onModeChange('manual')}
          >
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              mode === 'manual' ? "bg-white/20 animate-pulse" : "bg-green-200"
            )}>
              <Edit3 className={cn(
                "h-8 w-8 transition-all duration-300",
                mode === 'manual' ? "text-white" : "text-green-600"
              )} />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg mb-1">Manuel</div>
              <div className={cn(
                "text-sm",
                mode === 'manual' ? "text-white/90" : "text-green-700"
              )}>
                Vos numéros fétiches
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
