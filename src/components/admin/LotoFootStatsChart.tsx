import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLotoFootStats } from '@/hooks/useLotoFootStats';
import { getNextDrawDate } from '@/utils/drawDates';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { Users, Trophy, TrendingUp } from 'lucide-react';

export const LotoFootStatsChart = () => {
  const [drawDate, setDrawDate] = useState(getNextDrawDate('loto_foot'));
  const { data, isLoading } = useLotoFootStats(drawDate);

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des statistiques...</div>;
  }

  const totalWins = data?.stats.reduce((sum, s) => sum + s.wins, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Filtre date */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par tirage</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="draw-date">Date du tirage</Label>
          <Input
            id="draw-date"
            type="date"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-8 justify-around">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joueurs</p>
                <p className="text-2xl font-bold">{data?.stats.length || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total mises</p>
                <SuerteCoinsDisplay amount={data?.totalCost || 0} size="lg" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gagnants</p>
                <p className="text-2xl font-bold">{totalWins}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détails par joueur</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.stats && data.stats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead className="text-right">Grilles</TableHead>
                  <TableHead className="text-right">Mises</TableHead>
                  <TableHead className="text-right">Part</TableHead>
                  <TableHead className="text-right">Gains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stats.map((stat, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{stat.username}</TableCell>
                    <TableCell className="text-right">{stat.grid_count}</TableCell>
                    <TableCell className="text-right">
                      <SuerteCoinsDisplay amount={stat.total_cost} size="sm" />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {stat.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.wins > 0 ? (
                        <span className="text-green-600 font-semibold">{stat.wins}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée pour ce tirage
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
