import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const isSupported = "Notification" in window && "serviceWorker" in navigator;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !user || permission !== "granted") return null;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      let pushSubscription = await registration.pushManager.getSubscription();

      if (!pushSubscription) {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });
      }

      setSubscription(pushSubscription);
      return pushSubscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, permission, isSupported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) return;
    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      setSubscription(null);
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions): void => {
    if (permission !== "granted") return;
    new Notification(title, { icon: "/icon-192.png", badge: "/icon-192.png", ...options });
  }, [permission]);

  return { isSupported, permission, subscription, isLoading, requestPermission, subscribe, unsubscribe, sendLocalNotification };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
