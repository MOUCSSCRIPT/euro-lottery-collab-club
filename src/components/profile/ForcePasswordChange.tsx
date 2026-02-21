import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const ForcePasswordChange = ({ open }: { open: boolean }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isValid = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Set must_change_password to false
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false, updated_at: new Date().toISOString() })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre nouveau mot de passe a été enregistré.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le mot de passe.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Changement de mot de passe requis</DialogTitle>
          <DialogDescription className="text-center">
            Bienvenue ! Pour la sécurité de votre compte, veuillez choisir un nouveau mot de passe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Les mots de passe ne correspondent pas</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? 'Modification...' : 'Valider le nouveau mot de passe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
