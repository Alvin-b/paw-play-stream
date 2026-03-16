import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useRealtimeSubscription = () => {
  const { user } = useAuth();

  // Subscribe to new comments on a video
  const subscribeToComments = useCallback((videoId: string, onNewComment: (comment: any) => void) => {
    const channel = supabase
      .channel(`comments:${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          onNewComment(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to likes on a video
  const subscribeToLikes = useCallback((videoId: string, onLikeChange: (like: any) => void) => {
    const channel = supabase
      .channel(`likes:${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          onLikeChange(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to user's notifications
  const subscribeToNotifications = useCallback(() => {
    if (!user) return () => {};

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Show browser notification if permitted
          if (Notification.permission === "granted") {
            new Notification("New notification", {
              body: payload.new.message || "You have a new notification",
              icon: "/icon-192.png",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Subscribe to messages
  const subscribeToMessages = useCallback((onNewMessage: (message: any) => void) => {
    if (!user) return () => {};

    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all channels
      supabase.removeAllChannels();
    };
  }, []);

  return {
    subscribeToComments,
    subscribeToLikes,
    subscribeToNotifications,
    subscribeToMessages,
    requestNotificationPermission,
  };
};
