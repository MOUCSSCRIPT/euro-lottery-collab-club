import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { CartGrid } from '@/hooks/useCartStore';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';

interface CartGridPreviewProps {
  grid: CartGrid;
  onRemove: (id: string) => void;
}

export const CartGridPreview = ({ grid, onRemove }: CartGridPreviewProps) => {
  const predictionCount = Object.keys(grid.predictions).length;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Grille Loto Foot</span>
              <SuerteCoinsDisplay amount={grid.cost} size="sm" />
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{predictionCount} pronostics • {grid.combinations || 1} combinaison{(grid.combinations || 1) > 1 ? 's' : ''}</p>
              {grid.playerName && <p>Joueur : {grid.playerName}</p>}
              <p>Tirage : {grid.drawDate}</p>
            </div>
            
            <div className="mt-3 grid grid-cols-5 gap-1">
              {Object.entries(grid.predictions).slice(0, 15).map(([matchId, predictions], idx) => (
                <div
                  key={matchId}
                  className="text-xs font-bold rounded px-1 py-0.5 text-center bg-muted"
                >
                  {Array.isArray(predictions) 
                    ? predictions.join(',') 
                    : predictions}
                </div>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(grid.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
