import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLotoFootGrid } from '@/hooks/useAdminLotoFootGrids';
import { LotoFootMatch } from '@/types/loto-foot';

interface AllSelectionsViewProps {
  grids: AdminLotoFootGrid[];
  matches: LotoFootMatch[];
}

function parsePredictions(predictions: any): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (Array.isArray(predictions)) {
    predictions.forEach((item: any) => {
      const preds = Array.isArray(item.predictions) ? item.predictions : [item.predictions];
      map.set(item.match_position, preds);
    });
  } else if (predictions && typeof predictions === 'object') {
    Object.entries(predictions).forEach(([key, val]: [string, any]) => {
      const preds = Array.isArray(val) ? val : [val];
      map.set(parseInt(key), preds);
    });
  }
  return map;
}

export const AllSelectionsView = ({ grids, matches }: AllSelectionsViewProps) => {
  // Build counts per match
  const matchCounts = matches.map((match) => {
    let count1 = 0, countN = 0, count2 = 0;
    grids.forEach((grid) => {
      const predsMap = parsePredictions(grid.predictions);
      const preds = predsMap.get(match.match_position) || [];
      if (preds.includes('1')) count1++;
      if (preds.includes('N') || preds.includes('X')) countN++;
      if (preds.includes('2')) count2++;
    });
    const max = Math.max(count1, countN, count2);
    return { match, count1, countN, count2, max };
  });

  const cellClass = (count: number, max: number) => {
    if (count === 0) return 'text-muted-foreground';
    if (count === max) return 'font-bold text-foreground bg-primary/10';
    return 'text-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue globale des sélections</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Match</TableHead>
              <TableHead className="text-center w-16">1</TableHead>
              <TableHead className="text-center w-16">N</TableHead>
              <TableHead className="text-center w-16">2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchCounts.map((row) => (
              <TableRow key={row.match.id}>
                <TableCell className="font-mono text-muted-foreground">{row.match.match_position}</TableCell>
                <TableCell className="text-sm">
                  {row.match.home_team} - {row.match.away_team}
                </TableCell>
                <TableCell className={`text-center ${cellClass(row.count1, row.max)}`}>{row.count1}</TableCell>
                <TableCell className={`text-center ${cellClass(row.countN, row.max)}`}>{row.countN}</TableCell>
                <TableCell className={`text-center ${cellClass(row.count2, row.max)}`}>{row.count2}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
