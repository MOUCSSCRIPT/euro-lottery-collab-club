import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminLotoFootGrid } from '@/hooks/useAdminLotoFootGrids';
import { LotoFootMatch } from '@/types/loto-foot';

interface PlayerSlideViewProps {
  grid: AdminLotoFootGrid;
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

export const PlayerSlideView = ({ grid, matches }: PlayerSlideViewProps) => {
  const predsMap = parsePredictions(grid.predictions);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="font-semibold">{grid.username}</span>
          <Badge variant="outline" className="text-xs">{grid.cost} SC</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground w-6">#</th>
              <th className="text-left py-1.5 px-1 font-medium text-muted-foreground">Domicile</th>
              <th className="text-center py-1.5 px-1 font-medium text-muted-foreground w-8">1</th>
              <th className="text-center py-1.5 px-1 font-medium text-muted-foreground w-8">N</th>
              <th className="text-center py-1.5 px-1 font-medium text-muted-foreground w-8">2</th>
              <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">Extérieur</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const preds = predsMap.get(match.id) || predsMap.get(String(match.match_position)) || [];
              return (
                <tr key={match.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-1.5 px-2 text-muted-foreground font-mono">{match.match_position}</td>
                  <td className="py-1.5 px-1 truncate max-w-[100px]">{match.home_team}</td>
                  {['1', 'N', '2'].map((val) => {
                    const selected = preds.includes(val) || (val === 'N' && preds.includes('X'));
                    return (
                      <td key={val} className="py-1.5 px-1 text-center">
                        {selected ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${
                            val === '1' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                            val === 'N' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                            'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          }`}>
                            {val}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-muted-foreground/20">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-2 text-right truncate max-w-[100px]">{match.away_team}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
