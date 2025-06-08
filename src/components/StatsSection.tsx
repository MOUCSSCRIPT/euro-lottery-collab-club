
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Users, Dices } from 'lucide-react';

export const StatsSection = () => {
  const stats = [
    {
      title: "Gains totaux",
      value: "2,847€",
      change: "+12.5%",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Groupes actifs",
      value: "3",
      change: "+1",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Grilles jouées",
      value: "847",
      change: "+156",
      icon: Dices,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Taux de réussite",
      value: "23.4%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  const recentWins = [
    { date: "2024-06-08", group: "Les Chanceux du Vendredi", amount: 47, rank: "Rang 9" },
    { date: "2024-06-04", group: "Super Syndicate", amount: 156, rank: "Rang 8" },
    { date: "2024-05-28", group: "Amis de la Fortune", amount: 23, rank: "Rang 10" },
    { date: "2024-05-21", group: "Les Chanceux du Vendredi", amount: 891, rank: "Rang 6" }
  ];

  return (
    <section id="stats" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">Mes Statistiques</h3>
          <p className="text-muted-foreground">Suivez vos performances et gains</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Wins */}
        <Card className="p-6">
          <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Gains récents
          </h4>
          <div className="space-y-3">
            {recentWins.map((win, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{win.group}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(win.date).toLocaleDateString('fr-FR')} • {win.rank}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">+{win.amount}€</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
