import { useCallback, useEffect, useRef, useState } from 'react';

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const permissionRef = useRef(permission);
  permissionRef.current = permission;

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    permissionRef.current = result;
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permissionRef.current !== 'granted') return;

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
    },
    []
  );

  return { permission, requestPermission, notify };
}
