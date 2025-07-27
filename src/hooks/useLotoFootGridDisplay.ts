import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LotoFootGrid } from '@/types/loto-foot';
import { useEffect, useRef } from 'react';

export const useLotoFootGridDisplay = (groupId: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Real-time listener for grid changes
  useEffect(() => {
    if (!groupId) return;

    // Clean up existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('Error removing channel:', error);
      }
      channelRef.current = null;
    }

    // Create new channel for real-time updates
    const channelName = `loto-foot-grids-${groupId}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loto_foot_grids',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('Loto foot grid changed:', payload);
            queryClient.invalidateQueries({ queryKey: ['loto-foot-grids-display', groupId] });
          }
        );

      if (channel) {
        channel.subscribe((status) => {
          console.log('Loto foot grids subscription status:', status);
        });
        channelRef.current = channel;
      }
    } catch (error) {
      console.log('Error creating loto foot grids subscription:', error);
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.log('Error in cleanup:', error);
        }
        channelRef.current = null;
      }
    };
  }, [groupId, queryClient]);

  return useQuery({
    queryKey: ['loto-foot-grids-display', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loto_foot_grids')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(grid => ({
        ...grid,
        predictions: grid.predictions as unknown as any[]
      })) as (LotoFootGrid & { predictions: any[] })[];
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};