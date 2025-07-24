
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetInputProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
}

export const BudgetInput = ({ budget, onBudgetChange }: BudgetInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="budget">Budget total du groupe (€)</Label>
      <Input
        id="budget"
        type="number"
        value={budget}
        onChange={(e) => onBudgetChange(Number(e.target.value))}
        min="2.5"
        step="0.5"
      />
    </div>
  );
};
