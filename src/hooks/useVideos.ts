import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoWithProfile {
  id: string;
  video_url: string;
  description: string | null;
  music_name: string | null;
  hashtags: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  bookmarks_count: number;
  views_count: number;
  user_id: string;
  created_at: string;
  is_public: boolean | null;
  user: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    verified: boolean | null;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

export const useVideos = (feedType: "foryou" | "following" = "foryou") => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("videos")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (feedType === "following" && user) {
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = followingData?.map((f) => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in("user_id", followingIds);
      } else {
        setVideos([]);
        setLoading(false);
        return;
      }
    }

    const { data: videosData } = await query;
    if (!videosData || videosData.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    // Get profiles for all video authors
    const userIds = [...new Set(videosData.map((v) => v.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url, verified")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    // Get user's likes and bookmarks
    let likedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();
    if (user) {
      const videoIds = videosData.map((v) => v.id);
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        supabase.from("likes").select("video_id").eq("user_id", user.id).in("video_id", videoIds),
        supabase.from("bookmarks").select("video_id").eq("user_id", user.id).in("video_id", videoIds),
      ]);
      likedIds = new Set(likes?.map((l) => l.video_id) || []);
      bookmarkedIds = new Set(bookmarks?.map((b) => b.video_id) || []);
    }

    const enriched: VideoWithProfile[] = videosData.map((v) => {
      const p = profileMap.get(v.user_id);
      return {
        ...v,
        likes_count: v.likes_count || 0,
        comments_count: v.comments_count || 0,
        shares_count: v.shares_count || 0,
        bookmarks_count: v.bookmarks_count || 0,
        views_count: v.views_count || 0,
        user: {
          username: p?.username || "unknown",
          display_name: p?.display_name || "Unknown",
          avatar_url: p?.avatar_url || null,
          verified: p?.verified || false,
        },
        isLiked: likedIds.has(v.id),
        isBookmarked: bookmarkedIds.has(v.id),
      };
    });

    setVideos(enriched);
    setLoading(false);
  }, [user, feedType]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, refetch: fetchVideos };
};

export const useToggleLike = () => {
  const { user } = useAuth();

  return async (videoId: string, isLiked: boolean) => {
    if (!user) return;
    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, video_id: videoId });
    }
  };
};

export const useToggleBookmark = () => {
  const { user } = useAuth();

  return async (videoId: string, isBookmarked: boolean) => {
    if (!user) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, video_id: videoId });
    }
  };
};
