import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLotoFootStats } from '@/hooks/useLotoFootStats';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getNextDrawDate } from '@/utils/drawDates';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { Users, Trophy, TrendingUp } from 'lucide-react';

export const LotoFootStatsChart = () => {
  const [drawDate, setDrawDate] = useState(getNextDrawDate('loto_foot'));
  const { data, isLoading } = useLotoFootStats(drawDate);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des statistiques...</div>;
  }

  const pieData = data?.stats.map(stat => ({
    name: stat.username,
    value: stat.percentage,
    cost: stat.total_cost,
  })) || [];

  const barData = data?.stats.map(stat => ({
    name: stat.username,
    grids: stat.grid_count,
    wins: stat.wins,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Date selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par tirage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="draw-date">Date du tirage</Label>
            <Input
              id="draw-date"
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joueurs</p>
                <p className="text-2xl font-bold">{data?.stats.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total des mises</p>
                <SuerteCoinsDisplay amount={data?.totalCost || 0} size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grilles gagnantes</p>
                <p className="text-2xl font-bold">
                  {data?.stats.reduce((sum, s) => sum + s.wins, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie chart - Participation */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition des participations</CardTitle>
            <CardDescription>Pourcentage des mises par joueur</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name, props) => [
                    `${value.toFixed(1)}% (${props.payload.cost} SC)`,
                    'Participation'
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar chart - Grids and wins */}
      {barData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grilles jouées et gagnées</CardTitle>
            <CardDescription>Nombre de grilles par joueur</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="grids" fill="hsl(var(--primary))" name="Grilles jouées" />
                <Bar dataKey="wins" fill="hsl(var(--chart-2))" name="Grilles gagnantes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed table */}
      {data?.stats && data.stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détails par joueur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Joueur</th>
                    <th className="text-right p-2">Grilles</th>
                    <th className="text-right p-2">Mises totales</th>
                    <th className="text-right p-2">Participation</th>
                    <th className="text-right p-2">Gains</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stats.map((stat, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{stat.username}</td>
                      <td className="text-right p-2">{stat.grid_count}</td>
                      <td className="text-right p-2">
                        <SuerteCoinsDisplay amount={stat.total_cost} size="sm" />
                      </td>
                      <td className="text-right p-2">{stat.percentage.toFixed(1)}%</td>
                      <td className="text-right p-2">
                        {stat.wins > 0 ? (
                          <span className="text-green-600 font-medium">{stat.wins}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
