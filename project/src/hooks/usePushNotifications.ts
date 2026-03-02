import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';
export type NotificationError = 'denied' | 'unsupported' | 'vapid_missing' | 'subscription_failed' | 'database_error' | null;

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [error, setError] = useState<NotificationError>(null);

  const checkPushSupport = useCallback(() => {
    const supported = 'serviceWorker' in navigator &&
                     'PushManager' in window &&
                     'Notification' in window;
    setIsSupported(supported);

    if (!supported) {
      setPermissionStatus('unsupported');
    } else if ('Notification' in window) {
      setPermissionStatus(Notification.permission as NotificationPermissionStatus);
    }

    return supported;
  }, []);

  const checkExistingSubscription = useCallback(async () => {
    if (!user || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const { data, error: dbError } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .maybeSingle();

        if (!dbError && data) {
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  }, [user]);

  useEffect(() => {
    checkPushSupport();
    if (user) {
      checkExistingSubscription();
    }
  }, [user, checkPushSupport, checkExistingSubscription]);

  const requestBrowserPermission = async (): Promise<NotificationPermissionStatus> => {
    setError(null);

    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      setError('unsupported');
      return 'unsupported';
    }

    const currentPermission = Notification.permission;

    if (currentPermission === 'granted') {
      setPermissionStatus('granted');
      return 'granted';
    }

    if (currentPermission === 'denied') {
      setPermissionStatus('denied');
      setError('denied');
      return 'denied';
    }

    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as NotificationPermissionStatus);

      if (permission === 'denied') {
        setError('denied');
      }

      return permission as NotificationPermissionStatus;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('denied');
      return 'denied';
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPushNotifications = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('unsupported');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const permission = await requestBrowserPermission();
      if (permission !== 'granted') {
        return false;
      }

      if (!user) {
        return true;
      }

      const registration = await navigator.serviceWorker.ready;

      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn('VAPID public key not configured - push notifications will use browser-only mode');
        return true;
      }

      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))),
            user_agent: navigator.userAgent
          }, {
            onConflict: 'user_id,endpoint'
          });

        if (dbError) {
          console.error('Database error:', dbError);
          setError('database_error');
          return true;
        }

        setIsSubscribed(true);
        return true;
      } catch (subscriptionError) {
        console.warn('Push subscription failed, using browser-only notifications:', subscriptionError);
        return true;
      }
    } catch (err) {
      console.error('Error in push notification subscription:', err);
      setError('subscription_failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      if (user) {
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        if (dbError) {
          console.error('Database error during unsubscribe:', dbError);
        }
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('Dealio', {
        body: 'Notifications are working!',
        icon: '/icons/icon-192x192.svg'
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    permissionStatus,
    error,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    requestBrowserPermission,
    sendTestNotification
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
