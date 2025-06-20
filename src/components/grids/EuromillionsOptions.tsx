
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro } from 'lucide-react';
import { EuromillionsOptions, EUROMILLIONS_PRICES, SystemType } from '@/types/euromillions';

interface EuromillionsOptionsProps {
  options: EuromillionsOptions;
  onOptionsChange: (options: EuromillionsOptions) => void;
}

export const EuromillionsOptionsComponent = ({ options, onOptionsChange }: EuromillionsOptionsProps) => {
  const calculateTotalPrice = () => {
    let total = options.gridCount * EUROMILLIONS_PRICES.baseGrid;
    
    if (options.luckyNumbers) {
      total += EUROMILLIONS_PRICES.luckyNumbers;
    }
    
    if (options.system && options.system !== '') {
      total += EUROMILLIONS_PRICES.systems[options.system as keyof typeof EUROMILLIONS_PRICES.systems];
    }
    
    return total;
  };

  const handleGridCountChange = (value: string) => {
    const count = Math.max(1, Math.min(200, parseInt(value) || 1));
    onOptionsChange({ ...options, gridCount: count });
  };

  const handleLuckyNumbersChange = (checked: boolean) => {
    onOptionsChange({ ...options, luckyNumbers: checked });
  };

  const handleSystemChange = (value: string) => {
    onOptionsChange({ 
      ...options, 
      system: value as SystemType
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-blue-600" />
          Options de jeu FDJ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grid-count">Nombre de grilles</Label>
            <Input
              id="grid-count"
              type="number"
              min="1"
              max="200"
              value={options.gridCount}
              onChange={(e) => handleGridCountChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">2,50€ par grille</p>
          </div>

          <div className="space-y-2">
            <Label>Options supplémentaires</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lucky-numbers"
                checked={options.luckyNumbers}
                onCheckedChange={handleLuckyNumbersChange}
              />
              <Label htmlFor="lucky-numbers" className="text-sm">
                Numéros Chance (+1,00€)
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-select">Système</Label>
            <Select value={options.system} onValueChange={handleSystemChange}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun système" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun système</SelectItem>
                <SelectItem value="System 7">Système 7 (+7,00€)</SelectItem>
                <SelectItem value="System 8">Système 8 (+28,00€)</SelectItem>
                <SelectItem value="System 9">Système 9 (+84,00€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-green-600">
                {calculateTotalPrice().toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
