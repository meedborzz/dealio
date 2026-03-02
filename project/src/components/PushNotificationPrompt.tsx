import React from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PushNotificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  isOpen,
  onClose
}) => {
  const { subscribeToPushNotifications, loading } = usePushNotifications();

  const handleEnable = async () => {
    const success = await subscribeToPushNotifications();
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Restez informé(e)
            </h3>
            <p className="text-muted-foreground text-sm">
              Recevez des notifications pour vos réservations, nouvelles offres et rappels de RDV
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleEnable}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Activation...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Activer les notifications
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Plus tard
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              🔒 Vous pouvez les désactiver à tout moment dans vos paramètres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationPrompt;