import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCheck, UserX, Clock, User } from 'lucide-react';
import { useTeamRequests } from '@/hooks/useTeamRequests';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TeamRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export const TeamRequestsModal = ({ open, onOpenChange, groupId }: TeamRequestsModalProps) => {
  const { pendingRequests, isLoadingRequests, approveRequest, rejectRequest, isApprovingRequest, isRejectingRequest } = useTeamRequests(groupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Demandes d'adhésion ({pendingRequests.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {isLoadingRequests ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune demande en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Nouveau joueur</span>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(request.created_at), { 
                            addSuffix: true,
                            locale: fr 
                          })}
                        </Badge>
                      </div>
                      {request.message && (
                        <p className="text-sm text-muted-foreground">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveRequest(request.id)}
                      disabled={isApprovingRequest || isRejectingRequest}
                      className="flex-1"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRequest(request.id)}
                      disabled={isApprovingRequest || isRejectingRequest}
                      className="flex-1"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};