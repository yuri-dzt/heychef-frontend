import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Inside the native app the browser Notification API does not exist (Android
// WebView), so we use Capacitor's native local notifications there and fall
// back to the web Notification API on desktop/browser.
const isNative = Capacitor.isNativePlatform();

let notificationId = 1;

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (isNative) return 'default';
    return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  });
  const permissionRef = useRef(permission);
  permissionRef.current = permission;

  useEffect(() => {
    if (isNative) {
      LocalNotifications.checkPermissions()
        .then((p) => setPermission(p.display === 'granted' ? 'granted' : 'default'))
        .catch(() => setPermission('denied'));
      return;
    }
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (isNative) {
      const result = await LocalNotifications.requestPermissions();
      const next: NotificationPermission = result.display === 'granted' ? 'granted' : 'denied';
      setPermission(next);
      permissionRef.current = next;
      return;
    }
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    permissionRef.current = result;
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionRef.current !== 'granted') return;

    if (isNative) {
      LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId++,
            title,
            body: (options?.body as string) ?? '',
          },
        ],
      }).catch(() => {
        /* ignore scheduling errors */
      });
      return;
    }

    const notification = new Notification(title, {
      icon: '/logo.svg',
      badge: '/logo.svg',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 8000);
  }, []);

  return { permission, requestPermission, notify };
}
