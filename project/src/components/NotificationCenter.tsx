import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, RotateCcw, Calendar, Heart, Gift, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUnreadNotifications, markNotificationAsRead } from '../lib/notifications';
import { Notification as AppNotification, Deal } from '../shared/types/contracts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const unreadNotifications = await getUnreadNotifications(user.id);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const fetchAndNavigateToDeal = async (dealId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: deal, error } = await supabase
        .from('deals')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('id', dealId)
        .single();

      if (error) throw error;
      
      if (deal) {
        const transformedDeal = {
          ...deal,
          business: deal.business
        } as Deal;
        navigate(`/deals/${transformedDeal.id}`);
        onClose();
      } else {
        navigate('/');
        onClose();
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
      navigate('/');
      onClose();
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read
    await handleMarkAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking_confirmation':
      case 'booking_reminder':
      case 'booking_rescheduled':
        // Navigate to client bookings page
        if (notification.related_booking_id) {
          navigate('/bookings');
          onClose();
        }
        break;
      case 'promotional_offer':
      case 'deal_expiring_soon':
        if (notification.related_deal_id) {
          // Fetch and navigate to specific deal
          fetchAndNavigateToDeal(notification.related_deal_id);
        }
        onClose();
        break;
      case 'business_message':
        // Open messaging with specific business
        if (notification.related_business_id) {
          // Could open messaging modal directly
          navigate('/profile');
          onClose();
        }
        break;
      default:
        navigate('/profile');
        onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return <Check className="h-5 w-5 text-[#c8a2c9]" />;
      case 'booking_reminder':
        return <Calendar className="h-5 w-5 text-[#c8a2c9]" />;
      case 'booking_cancellation':
        return <X className="h-5 w-5 text-red-600" />;
      case 'booking_rescheduled':
        return <Calendar className="h-5 w-5 text-[#c8a2c9]" />;
      case 'booking_completed':
        return <Check className="h-5 w-5 text-[#c8a2c9]" />;
      case 'promotional_offer':
        return <Gift className="h-5 w-5 text-[#c8a2c9]" />;
      case 'deal_expiring_soon':
        return <Bell className="h-5 w-5 text-[#c8a2c9]" />;
      case 'business_message':
        return <MessageSquare className="h-5 w-5 text-[#c8a2c9]" />;
      case 'system_update':
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
      case 'booking_completed':
        return 'bg-[#c8a2c9]/10 dark:bg-[#c8a2c9]/20 border-[#c8a2c9]/30 dark:border-[#c8a2c9]/40';
      case 'booking_reminder':
        return 'bg-[#c8a2c9]/10 dark:bg-[#c8a2c9]/20 border-[#c8a2c9]/30 dark:border-[#c8a2c9]/40';
      case 'booking_cancellation':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'booking_rescheduled':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 'promotional_offer':
      case 'deal_expiring_soon':
        return 'bg-primary/5 border-primary/20';
      case 'business_message':
        return 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-muted border-border';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
            {notifications.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">Vous etes a jour !</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${getNotificationColor(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">{getNotificationIcon(notification.type)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(notification.sent_at), 'HH:mm - d MMM', { locale: fr })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check className="h-4 w-4 text-muted-foreground hover:text-green-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/50">
            <button
              onClick={async () => {
                const promises = notifications.map(n => markNotificationAsRead(n.id));
                await Promise.all(promises);
                setNotifications([]);
              }}
              className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              Tout marquer comme lu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;