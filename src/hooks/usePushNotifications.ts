import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  // Check if push is supported
  const isSupported = "Notification" in window && "serviceWorker" in navigator;

  // Request permission
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

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !user || permission !== "granted") return null;

    setIsLoading(true);
    try {
      // Get existing subscription
      const registration = await navigator.serviceWorker.ready;
      let pushSubscription = await registration.pushManager.getSubscription();

      if (!pushSubscription) {
        // Create new subscription
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Send to backend
await supabase.rpc("upsert_push_subscription", {
        user_id: user.id,
        subscription_json: JSON.stringify(pushSubscription),
      });

      setSubscription(pushSubscription);
      return pushSubscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, permission, isSupported]);

  // Unsubscribe from push
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) return;

    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      
      if (user) {
// Push subscriptions cleanup handled by RPC or manual DB
console.log("Push subscription unsubscribed locally");
      }
      
      setSubscription(null);
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
    } finally {
      setIsLoading(false);
    }
  }, [subscription, user]);

  // Send local notification (for testing)
  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions): void => {
    if (permission !== "granted") return;

    new Notification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      ...options,
    });
  }, [permission]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  };
};

// Helper to convert VAPID key
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
