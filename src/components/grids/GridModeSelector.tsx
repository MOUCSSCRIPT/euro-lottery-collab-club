
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
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Comment souhaitez-vous créer vos grilles ?</h3>
          <p className="text-sm text-muted-foreground">
            Choisissez entre la génération automatique ou la saisie manuelle
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant={mode === 'auto' ? 'default' : 'outline'}
            className={cn(
              "h-auto p-6 flex flex-col items-center gap-3",
              mode === 'auto' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "hover:bg-blue-50 hover:border-blue-300"
            )}
            onClick={() => onModeChange('auto')}
          >
            <div className={cn(
              "p-3 rounded-full",
              mode === 'auto' ? "bg-blue-500" : "bg-blue-100"
            )}>
              <Dices className={cn(
                "h-6 w-6",
                mode === 'auto' ? "text-white" : "text-blue-600"
              )} />
            </div>
            <div className="text-center">
              <div className="font-semibold mb-1">Génération automatique</div>
              <div className={cn(
                "text-xs",
                mode === 'auto' ? "text-blue-100" : "text-muted-foreground"
              )}>
                Laissez le hasard choisir vos numéros de façon optimisée
              </div>
            </div>
          </Button>

          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            className={cn(
              "h-auto p-6 flex flex-col items-center gap-3",
              mode === 'manual' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "hover:bg-green-50 hover:border-green-300"
            )}
            onClick={() => onModeChange('manual')}
          >
            <div className={cn(
              "p-3 rounded-full",
              mode === 'manual' ? "bg-green-500" : "bg-green-100"
            )}>
              <Edit3 className={cn(
                "h-6 w-6",
                mode === 'manual' ? "text-white" : "text-green-600"
              )} />
            </div>
            <div className="text-center">
              <div className="font-semibold mb-1">Saisie manuelle</div>
              <div className={cn(
                "text-xs",
                mode === 'manual' ? "text-green-100" : "text-muted-foreground"
              )}>
                Choisissez vous-même vos numéros et étoiles porte-bonheur
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
