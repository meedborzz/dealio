import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  initializeOneSignal,
  isOneSignalSupported,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  isUserSubscribed,
  getNotificationPermissionStatus,
  setUserExternalId,
} from '../lib/oneSignal';

export type OneSignalPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function useOneSignal() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<OneSignalPermissionStatus>('default');
  const [isIOSNotInstalled, setIsIOSNotInstalled] = useState(false);

  const checkSupport = useCallback(() => {
    const supported = isOneSignalSupported();
    setIsSupported(supported);

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;

    if (isIOSDevice && !isStandalone) {
      setIsIOSNotInstalled(true);
      setIsSupported(false);
    }

    return supported;
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported || import.meta.env.DEV) return;

    try {
      const subscribed = await isUserSubscribed();
      setIsSubscribed(subscribed);

      const permission = await getNotificationPermissionStatus();
      setPermissionStatus(permission as OneSignalPermissionStatus);
    } catch (error) {
      console.error('Error checking OneSignal subscription:', error);
    }
  }, [isSupported]);

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  useEffect(() => {
    if (isSupported && !import.meta.env.DEV) {
      initializeOneSignal().then(() => {
        checkSubscriptionStatus();
      });
    }
  }, [isSupported, checkSubscriptionStatus]);

  useEffect(() => {
    if (user && isSupported && !import.meta.env.DEV) {
      setUserExternalId(user.id).catch(console.error);
    }
  }, [user, isSupported]);

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    if (import.meta.env.DEV) {
      console.log('OneSignal: Subscribe called in dev mode (no-op)');
      return false;
    }

    try {
      setLoading(true);
      const success = await subscribeToNotifications(user?.id);

      if (success) {
        setIsSubscribed(true);
        setPermissionStatus('granted');
      }

      return success;
    } catch (error) {
      console.error('Error subscribing to OneSignal:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (import.meta.env.DEV) {
      console.log('OneSignal: Unsubscribe called in dev mode (no-op)');
      return true;
    }

    try {
      setLoading(true);
      const success = await unsubscribeFromNotifications();

      if (success) {
        setIsSubscribed(false);
      }

      return success;
    } catch (error) {
      console.error('Error unsubscribing from OneSignal:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    permissionStatus,
    isIOSNotInstalled,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
  };
}
