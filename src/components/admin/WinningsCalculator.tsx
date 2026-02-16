import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LotoFootPlayerStats } from '@/hooks/useLotoFootStats';

interface WinningsCalculatorProps {
  stats: LotoFootPlayerStats[];
  totalCost: number;
}

export const WinningsCalculator = ({ stats, totalCost }: WinningsCalculatorProps) => {
  const [totalWinnings, setTotalWinnings] = useState('');

  const winningsNum = parseFloat(totalWinnings) || 0;

  const playerWinnings = stats.map((stat) => ({
    ...stat,
    gain: totalCost > 0 ? winningsNum * (stat.total_cost / totalCost) * 100 / 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des gains</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <Label htmlFor="total-winnings">Montant total gagné</Label>
          <Input
            id="total-winnings"
            type="number"
            min="0"
            step="0.01"
            value={totalWinnings}
            onChange={(e) => setTotalWinnings(e.target.value)}
            placeholder="Ex: 500"
            className="mt-1"
          />
        </div>

        {winningsNum > 0 && stats.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead className="text-right">Mise</TableHead>
                <TableHead className="text-right">Part</TableHead>
                <TableHead className="text-right">Gain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerWinnings.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{p.username}</TableCell>
                  <TableCell className="text-right">{p.total_cost} SC</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.percentage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-bold text-green-600">{p.gain.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {winningsNum <= 0 && (
          <p className="text-sm text-muted-foreground">
            Saisissez le montant total gagné pour calculer la répartition.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
