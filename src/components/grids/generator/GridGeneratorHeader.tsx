
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices } from 'lucide-react';

interface GridGeneratorHeaderProps {
  gridsLabel: string;
}

export const GridGeneratorHeader = ({ gridsLabel }: GridGeneratorHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Dices className="h-5 w-5 text-blue-600" />
        Générateur de {gridsLabel}
      </CardTitle>
      <CardDescription>
        Générez automatiquement des {gridsLabel} optimisées ou choisissez vos numéros manuellement
      </CardDescription>
    </CardHeader>
  );
};
