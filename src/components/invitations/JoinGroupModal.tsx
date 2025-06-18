
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Loader2 } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';

interface JoinGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinGroupModal = ({ open, onOpenChange }: JoinGroupModalProps) => {
  const [invitationCode, setInvitationCode] = useState('');
  const { joinGroup, isJoiningGroup } = useInvitations();

  const handleJoinGroup = () => {
    if (invitationCode.trim()) {
      joinGroup({ invitationCode: invitationCode.trim().toUpperCase() });
      setInvitationCode('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Rejoindre un groupe
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Code d'invitation</Label>
            <Input
              id="code"
              placeholder="Entrez le code d'invitation"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              className="mt-2"
              maxLength={8}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Le code d'invitation fait 8 caractères (ex: ABC12345)
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleJoinGroup}
              disabled={!invitationCode.trim() || isJoiningGroup}
              className="flex-1"
            >
              {isJoiningGroup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejoindre...
                </>
              ) : (
                'Rejoindre le groupe'
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
