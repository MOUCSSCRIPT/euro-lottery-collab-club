
import React from 'react';
import { Trophy } from 'lucide-react';

export const LotoFootInstructions = () => {
  return (
    <div className="bg-orange-50 p-3 rounded-lg text-sm">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-4 w-4 text-orange-600" />
        <span className="font-medium text-orange-800">Comment jouer :</span>
      </div>
      <div className="text-orange-700 space-y-1">
        <div>• <strong>1</strong> : Victoire de l'équipe à domicile</div>
        <div>• <strong>N</strong> : Match nul</div>
        <div>• <strong>2</strong> : Victoire de l'équipe à l'extérieur</div>
        <div>• Vous pouvez sélectionner <strong>plusieurs résultats par match</strong></div>
      </div>
    </div>
  );
};
