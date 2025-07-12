
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Loader2 } from 'lucide-react';
import { useTeamRequests } from '@/hooks/useTeamRequests';

interface JoinTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinTeamModal = ({ open, onOpenChange }: JoinTeamModalProps) => {
  const [teamCode, setTeamCode] = useState('');
  const [message, setMessage] = useState('');
  const { requestToJoinTeam, isRequestingToJoin } = useTeamRequests();

  const handleRequestToJoin = () => {
    if (teamCode.trim()) {
      requestToJoinTeam({ 
        teamCode: teamCode.trim().toUpperCase(),
        message: message.trim() || undefined 
      });
      setTeamCode('');
      setMessage('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Demander à rejoindre une TEAM
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Code de la TEAM</Label>
            <Input
              id="code"
              placeholder="Entrez le code de la TEAM"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              className="mt-2"
              maxLength={8}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Le code de la TEAM fait 8 caractères (ex: ABC12345)
            </p>
          </div>

          <div>
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Présentez-vous au créateur de la TEAM..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Votre demande sera soumise à l'approbation du créateur
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleRequestToJoin}
              disabled={!teamCode.trim() || isRequestingToJoin}
              className="flex-1"
            >
              {isRequestingToJoin ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
