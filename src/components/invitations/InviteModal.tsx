
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Mail, Link } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export const InviteModal = ({ open, onOpenChange, groupId, groupName }: InviteModalProps) => {
  const [email, setEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const { createInvitation, isCreatingInvitation } = useInvitations(groupId);
  const { toast } = useToast();

  const handleCreateInvitation = () => {
    createInvitation({ 
      groupId, 
      email: email.trim() || undefined 
    });
    
    // Simulate code generation for demo
    const newCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    setInvitationCode(newCode);
    
    if (email.trim()) {
      setEmail('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le code a été copié dans le presse-papiers",
    });
  };

  const shareUrl = invitationCode ? `${window.location.origin}/join/${invitationCode}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter des membres</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="email">Email (optionnel)</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCreateInvitation}
                disabled={isCreatingInvitation}
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Laissez vide pour créer un code d'invitation générique
            </p>
          </div>

          {invitationCode && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">
                ✅ Invitation créée avec succès !
              </p>
              <p className="text-sm text-muted-foreground">
                Les membres peuvent maintenant rejoindre le groupe "{groupName}" via le bouton "Rejoindre une team" sur la page d'accueil.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
