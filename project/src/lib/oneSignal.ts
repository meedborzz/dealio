declare global {
  interface Window {
    OneSignalDeferred?: Promise<any>;
    OneSignal?: any;
  }
}

let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

export const isOneSignalSupported = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if (isIOSDevice && !isStandalone) {
    return false;
  }

  return true;
};

export const loadOneSignalSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.OneSignal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));

    document.head.appendChild(script);
  });
};

export const initializeOneSignal = async (): Promise<boolean> => {
  if (import.meta.env.DEV) {
    console.log('OneSignal: Skipping initialization in development mode');
    return false;
  }

  if (isInitialized) {
    return true;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;

      if (!appId) {
        console.warn('OneSignal App ID not configured');
        return false;
      }

      if (!isOneSignalSupported()) {
        console.log('OneSignal not supported on this device/mode');
        return false;
      }

      await loadOneSignalSDK();

      if (!window.OneSignal) {
        console.error('OneSignal SDK failed to load');
        return false;
      }

      await window.OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: false,
        autoRegister: false,
        autoResubscribe: true,
        notifyButton: {
          enable: false,
        },
        serviceWorkerParam: {
          scope: '/'
        },
        serviceWorkerPath: 'OneSignalSDKWorker.js'
      });

      isInitialized = true;
      console.log('OneSignal initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      initializationPromise = null;
      return false;
    }
  })();

  return initializationPromise;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) {
      return false;
    }

    if (!window.OneSignal) {
      return false;
    }

    const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
    if (!isPushSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    const permission = await window.OneSignal.Notifications.permissionNative;
    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const result = await window.OneSignal.Notifications.requestPermission();
    return result;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getNotificationPermissionStatus = async (): Promise<string> => {
  try {
    if (!window.OneSignal) {
      return 'default';
    }

    const permission = await window.OneSignal.Notifications.permissionNative;
    return permission || 'default';
  } catch (error) {
    console.error('Error getting permission status:', error);
    return 'default';
  }
};

export const isUserSubscribed = async (): Promise<boolean> => {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized || !window.OneSignal) {
      return false;
    }

    const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
    return optedIn || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const subscribeToNotifications = async (userId?: string): Promise<boolean> => {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized || !window.OneSignal) {
      return false;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      return false;
    }

    if (userId) {
      await window.OneSignal.login(userId);
    }

    await window.OneSignal.User.PushSubscription.optIn();

    console.log('Successfully subscribed to OneSignal notifications');
    return true;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return false;
  }
};

export const unsubscribeFromNotifications = async (): Promise<boolean> => {
  try {
    if (!window.OneSignal) {
      return true;
    }

    await window.OneSignal.User.PushSubscription.optOut();

    console.log('Successfully unsubscribed from OneSignal notifications');
    return true;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return false;
  }
};

export const setUserExternalId = async (userId: string): Promise<void> => {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized || !window.OneSignal) {
      return;
    }

    await window.OneSignal.login(userId);
  } catch (error) {
    console.error('Error setting external user ID:', error);
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    if (!window.OneSignal) {
      return null;
    }

    const userId = await window.OneSignal.User.PushSubscription.id;
    return userId || null;
  } catch (error) {
    console.error('Error getting OneSignal user ID:', error);
    return null;
  }
};

export const sendTestNotification = async (): Promise<void> => {
  if (window.OneSignal) {
    console.log('Send test notification via OneSignal dashboard');
  }
};
