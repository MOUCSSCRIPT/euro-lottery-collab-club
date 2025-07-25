import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SuerteCoinsDisplay } from '@/components/ui/SuerteCoinsDisplay';
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || type !== 'email') {
        setStatus('error');
        setErrorMessage('Lien de confirmation invalide');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message === 'Token has expired or is invalid' 
            ? 'Le lien de confirmation a expiré ou est invalide' 
            : 'Erreur lors de la confirmation de votre email');
        } else {
          setStatus('success');
          toast({
            title: "Email confirmé !",
            description: "Votre compte a été activé avec succès.",
          });
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Une erreur inattendue s\'est produite');
      }
    };

    confirmEmail();
  }, [searchParams, toast]);

  const handleContinue = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Confirmation en cours...
            </h1>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous confirmons votre email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Erreur de confirmation
            </h1>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <Button onClick={handleContinue} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-foreground">
                Bienvenue sur SUERTE+
              </h1>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-lg text-foreground font-medium">
              Votre email a été confirmé avec succès !
            </p>
            
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <SuerteCoinsDisplay amount={50} size="lg" />
              </div>
              <p className="text-sm text-foreground font-medium">
                🎉 Bonus de bienvenue offert !
              </p>
            </div>

            <div className="text-left space-y-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-foreground text-sm">
                Pour commencer :
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Créez votre pseudo unique</li>
                <li>• Choisissez votre pays</li>
                <li>• Rejoignez des groupes de jeu</li>
                <li>• Tentez votre chance à l'EuroMillions !</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleContinue} 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            size="lg"
          >
            Commencer à jouer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}