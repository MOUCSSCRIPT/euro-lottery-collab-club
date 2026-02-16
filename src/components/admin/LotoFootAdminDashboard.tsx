import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Grid3X3, Eye, Percent, DollarSign, CalendarSearch } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLotoFootGrids } from '@/hooks/useAdminLotoFootGrids';
import { useLotoFootMatches } from '@/hooks/useLotoFootMatches';
import { useLotoFootStats } from '@/hooks/useLotoFootStats';
import { getNextDrawDate } from '@/utils/drawDates';
import { PlayerSlideView } from './PlayerSlideView';
import { ConsolidatedGrid } from './ConsolidatedGrid';
import { AllSelectionsView } from './AllSelectionsView';
import { WinningsCalculator } from './WinningsCalculator';
import { LotoFootStatsChart } from './LotoFootStatsChart';

const useLatestGridDate = () => {
  return useQuery({
    queryKey: ['latest-loto-foot-grid-date'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_loto_foot_grids')
        .select('draw_date')
        .order('draw_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.draw_date || null;
    },
  });
};

export const LotoFootAdminDashboard = () => {
  const [drawDate, setDrawDate] = useState(getNextDrawDate('loto_foot'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: latestDate } = useLatestGridDate();

  const { data: grids = [], isLoading: gridsLoading } = useAdminLotoFootGrids(drawDate);
  const { data: matches = [], isLoading: matchesLoading } = useLotoFootMatches(drawDate);
  const { data: statsData } = useLotoFootStats(drawDate);

  const isLoading = gridsLoading || matchesLoading;

  const handlePrev = useCallback(() => setCurrentSlide((p) => Math.max(0, p - 1)), []);
  const handleNext = useCallback(() => setCurrentSlide((p) => Math.min(grids.length - 1, p + 1)), [grids.length]);

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end gap-4">
            <div>
              <Label htmlFor="admin-draw-date">Date du tirage</Label>
              <Input
                id="admin-draw-date"
                type="date"
                value={drawDate}
                onChange={(e) => { setDrawDate(e.target.value); setCurrentSlide(0); }}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {grids.length} grille{grids.length > 1 ? 's' : ''} • {matches.length} match{matches.length > 1 ? 's' : ''}
            </div>
            {latestDate && latestDate !== drawDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDrawDate(latestDate); setCurrentSlide(0); }}
                className="flex items-center gap-1"
              >
                <CalendarSearch className="h-3 w-3" />
                Dernière date ({latestDate})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="slides" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            Joueurs
          </TabsTrigger>
          <TabsTrigger value="consolidated" className="flex items-center gap-1 text-xs">
            <Grid3X3 className="h-3 w-3" />
            Commune
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
            <Eye className="h-3 w-3" />
            Globale
          </TabsTrigger>
          <TabsTrigger value="participation" className="flex items-center gap-1 text-xs">
            <Percent className="h-3 w-3" />
            Participation
          </TabsTrigger>
          <TabsTrigger value="winnings" className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3 w-3" />
            Gains
          </TabsTrigger>
        </TabsList>

        {/* Slides joueurs */}
        <TabsContent value="slides" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : grids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune grille pour cette date</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentSlide === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentSlide + 1} / {grids.length}
                </span>
                <Button variant="outline" size="sm" onClick={handleNext} disabled={currentSlide >= grids.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <PlayerSlideView grid={grids[currentSlide]} matches={matches} />
            </div>
          )}
        </TabsContent>

        {/* Grille commune */}
        <TabsContent value="consolidated" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : grids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune grille pour cette date</div>
          ) : (
            <ConsolidatedGrid grids={grids} matches={matches} />
          )}
        </TabsContent>

        {/* Vue globale */}
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : grids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune grille pour cette date</div>
          ) : (
            <AllSelectionsView grids={grids} matches={matches} />
          )}
        </TabsContent>

        {/* Participation */}
        <TabsContent value="participation" className="mt-4">
          <LotoFootStatsChart />
        </TabsContent>

        {/* Gains */}
        <TabsContent value="winnings" className="mt-4">
          {statsData ? (
            <WinningsCalculator stats={statsData.stats} totalCost={statsData.totalCost} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
