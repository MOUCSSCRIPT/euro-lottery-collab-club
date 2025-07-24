
import React from 'react';
import { Calculator, Users } from 'lucide-react';
import { SuerteCoinsIcon } from '@/components/ui/SuerteCoinsIcon';

interface GridCalculationsProps {
  maxGrids: number;
  totalCost: number;
  memberCount: number;
  costPerMember: number;
  gridsLabel: string;
}

export const GridCalculations = ({ 
  maxGrids, 
  totalCost, 
  memberCount, 
  costPerMember, 
  gridsLabel 
}: GridCalculationsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <Calculator className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <div className="text-sm text-muted-foreground">{gridsLabel.charAt(0).toUpperCase() + gridsLabel.slice(1)} max</div>
          <div className="text-xl font-bold text-blue-600">{maxGrids}</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <SuerteCoinsIcon size={20} className="text-green-600 mx-auto mb-1" />
          <div className="text-sm text-muted-foreground">Coût total</div>
          <div className="text-xl font-bold text-green-600">{totalCost.toFixed(1)}</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-purple-50 p-3 rounded-lg">
          <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <div className="text-sm text-muted-foreground">Membres</div>
          <div className="text-xl font-bold text-purple-600">{memberCount}</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <SuerteCoinsIcon size={20} className="text-yellow-600 mx-auto mb-1" />
          <div className="text-sm text-muted-foreground">Par membre</div>
          <div className="text-xl font-bold text-yellow-600">{costPerMember.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};
