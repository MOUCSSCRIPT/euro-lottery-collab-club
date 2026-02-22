import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AdminLotoFootGrid } from '@/hooks/useAdminLotoFootGrids';
import { LotoFootMatch } from '@/types/loto-foot';

interface ConsolidatedGridProps {
  grids: AdminLotoFootGrid[];
  matches: LotoFootMatch[];
}

function parsePredictions(predictions: any): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (Array.isArray(predictions)) {
    predictions.forEach((item: any) => {
      const preds = Array.isArray(item.predictions) ? item.predictions : [item.predictions];
      map.set(String(item.match_position), preds);
    });
  } else if (predictions && typeof predictions === 'object') {
    Object.entries(predictions).forEach(([key, val]: [string, any]) => {
      const preds = Array.isArray(val) ? val : [val];
      map.set(key, preds);
    });
  }
  return map;
}

export const ConsolidatedGrid = ({ grids, matches }: ConsolidatedGridProps) => {
  // Calculate consolidated percentages per match
  const consolidatedData = matches.map((match) => {
    let count1 = 0, countN = 0, count2 = 0;

    grids.forEach((grid) => {
      const predsMap = parsePredictions(grid.predictions);
      const preds = predsMap.get(match.id) || predsMap.get(String(match.match_position)) || [];
      if (preds.includes('1')) count1++;
      if (preds.includes('N') || preds.includes('X')) countN++;
      if (preds.includes('2')) count2++;
    });

    const total = count1 + countN + count2;
    return {
      match,
      count1, countN, count2, total,
      pct1: total > 0 ? (count1 / total) * 100 : 0,
      pctN: total > 0 ? (countN / total) * 100 : 0,
      pct2: total > 0 ? (count2 / total) * 100 : 0,
    };
  });

  const totalStake = grids.reduce((sum, g) => sum + g.cost, 0);

  const totalCombinations = consolidatedData.reduce((acc, row) => {
    let choices = 0;
    if (row.count1 > 0) choices++;
    if (row.countN > 0) choices++;
    if (row.count2 > 0) choices++;
    return acc * Math.max(1, choices);
  }, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grille commune</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_repeat(3,4rem)_1fr] gap-1 text-xs font-semibold text-muted-foreground pb-2 border-b">
          <span>#</span>
          <span>Domicile</span>
          <span className="text-center">1</span>
          <span className="text-center">N</span>
          <span className="text-center">2</span>
          <span>Extérieur</span>
        </div>

        {consolidatedData.map((row) => (
          <div key={row.match.id} className="grid grid-cols-[2rem_1fr_repeat(3,4rem)_1fr] gap-1 items-center py-2 border-b last:border-0">
            <span className="text-xs font-mono text-muted-foreground">{row.match.match_position}</span>
            <span className="text-sm truncate font-medium">{row.match.home_team}</span>

            {/* 1 */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-green-600">{row.pct1.toFixed(0)}%</span>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.pct1}%` }} />
              </div>
            </div>

            {/* N */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-yellow-600">{row.pctN.toFixed(0)}%</span>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${row.pctN}%` }} />
              </div>
            </div>

            {/* 2 */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-blue-600">{row.pct2.toFixed(0)}%</span>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.pct2}%` }} />
              </div>
            </div>

            <span className="text-sm truncate font-medium">{row.match.away_team}</span>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 space-y-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Mise totale : <strong className="text-foreground">{totalStake} SC</strong></span>
            <span>{grids.length} joueur{grids.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Grille commune : <strong className="text-foreground">{totalCombinations.toLocaleString()} combinaison{totalCombinations > 1 ? 's' : ''} = {totalCombinations.toLocaleString()} SC</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
