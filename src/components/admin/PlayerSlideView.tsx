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

const predColors: Record<string, string> = {
  '1': 'bg-green-500/20 text-green-700 border-green-500/40',
  'X': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  'N': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  '2': 'bg-blue-500/20 text-blue-700 border-blue-500/40',
};

export const PlayerSlideView = ({ grid, matches }: PlayerSlideViewProps) => {
  const predsMap = parsePredictions(grid.predictions);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{grid.username}</span>
          <Badge variant="outline">{grid.cost} SC</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {matches.map((match) => {
          const preds = predsMap.get(match.id) || predsMap.get(String(match.match_position)) || [];
          return (
            <div key={match.id} className="flex items-center gap-2 text-sm border-b pb-2 last:border-0">
              <span className="w-6 text-muted-foreground font-mono">{match.match_position}</span>
              <span className="flex-1 truncate text-right">{match.home_team}</span>
              <div className="flex gap-1 min-w-[100px] justify-center">
                {['1', 'N', '2'].map((val) => {
                  const selected = preds.includes(val) || (val === 'N' && preds.includes('X'));
                  return (
                    <span
                      key={val}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border ${
                        selected ? (predColors[val] || 'bg-muted') : 'bg-transparent text-muted-foreground/30 border-transparent'
                      }`}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
              <span className="flex-1 truncate">{match.away_team}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
