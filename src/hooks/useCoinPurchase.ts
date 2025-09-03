import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useCoinPurchase = () => {
  const queryClient = useQueryClient();

  const verifyPurchase = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-coin-purchase', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Achat confirmé !",
          description: data.message,
        });
        // Refresh profile data
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast({
          title: "Vérification échouée",
          description: data?.message || "Impossible de vérifier le paiement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying purchase:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le paiement.",
        variant: "destructive",
      });
    }
  }, [queryClient]);

  useEffect(() => {
    // Check for purchase result in URL
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseStatus = urlParams.get('purchase');
    
    if (purchaseStatus === 'success') {
      toast({
        title: "Achat réussi !",
        description: "Vos SuerteCoins ont été ajoutés à votre compte.",
      });
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (purchaseStatus === 'cancelled') {
      toast({
        title: "Achat annulé",
        description: "Votre achat a été annulé.",
        variant: "destructive",
      });
      
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [queryClient]);

  return { verifyPurchase };
};