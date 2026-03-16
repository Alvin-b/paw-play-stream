import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoWithProfile {
  id: string;
  video_url: string;
  audio_url: string | null;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchVideos = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from("videos")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (feedType === "following" && user) {
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = followingData?.map((f) => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in("user_id", followingIds);
      } else {
        if (!append) setVideos([]);
        setLoading(false);
        setLoadingMore(false);
        setHasMore(false);
        return;
      }
    }

    const { data: videosData } = await query;
    if (!videosData || videosData.length === 0) {
      if (!append) setVideos([]);
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
      return;
    }

    // Get profiles for all video authors
    const userIds = [...new Set(videosData.map((v) => v.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url, verified")
      .in("user_id", userIds);

    type ProfileData = {
      user_id: string;
      username: string;
      display_name: string;
      avatar_url: string | null;
      verified: boolean | null;
    };
    
    const profileMap = new Map<ProfileData["user_id"], ProfileData>(
      profiles?.map((p) => [p.user_id, p as ProfileData]) || []
    );

    // Get user's likes and bookmarks
    let likedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();
    let followingIds = new Set<string>();

    if (user) {
      const videoIds = videosData.map((v) => v.id);
      const userIds = videosData.map((v) => v.user_id);

      const [{ data: likes }, { data: bookmarks }, { data: follows }] = await Promise.all([
        supabase.from("likes").select("video_id").eq("user_id", user.id).in("video_id", videoIds),
        supabase.from("bookmarks").select("video_id").eq("user_id", user.id).in("video_id", videoIds),
        supabase.from("follows").select("following_id").eq("follower_id", user.id).in("following_id", userIds),
      ]);

      likedIds = new Set(likes?.map((l) => l.video_id) || []);
      bookmarkedIds = new Set(bookmarks?.map((b) => b.video_id) || []);
      followingIds = new Set(follows?.map((f) => f.following_id) || []);
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
        user_id: v.user_id,
        user: {
          username: p?.username || "unknown",
          display_name: p?.display_name || "Unknown",
          avatar_url: p?.avatar_url || null,
          verified: p?.verified || false,
          isFollowing: followingIds.has(v.user_id),
        },
        isLiked: likedIds.has(v.id),
        isBookmarked: bookmarkedIds.has(v.id),
      };
    });

    if (append) {
      setVideos(prev => [...prev, ...enriched]);
    } else {
      setVideos(enriched);
    }
    setLoading(false);
    setLoadingMore(false);
    setHasMore(videosData.length === PAGE_SIZE);
  }, [user, feedType]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchVideos]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchVideos(0, false);
  }, [feedType]);

  return { videos, loading, loadingMore, hasMore, loadMore, refetch: () => fetchVideos(0, false) };
};

export const useToggleLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, isLiked }: { videoId: string; isLiked: boolean }) => {
      if (!user) return;
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("video_id", videoId);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, video_id: videoId });
      }
    },
    onMutate: async ({ videoId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["videos"] });
      
      const previousVideos = queryClient.getQueryData(["videos"]);
      
      queryClient.setQueryData(["videos"], (old: VideoWithProfile[] | undefined) => {
        if (!old) return old;
        return old.map((video) => {
          if (video.id === videoId) {
            return {
              ...video,
              isLiked: !isLiked,
              likes_count: isLiked ? video.likes_count - 1 : video.likes_count + 1,
            };
          }
          return video;
        });
      });
      
      return { previousVideos };
    },
    onError: (_err, { videoId, isLiked }, context) => {
      // Rollback on error
      if (context?.previousVideos) {
        queryClient.setQueryData(["videos"], context.previousVideos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};

export const useToggleBookmark = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, isBookmarked }: { videoId: string; isBookmarked: boolean }) => {
      if (!user) return;
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("video_id", videoId);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, video_id: videoId });
      }
    },
    onMutate: async ({ videoId, isBookmarked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["videos"] });
      
      const previousVideos = queryClient.getQueryData(["videos"]);
      
      queryClient.setQueryData(["videos"], (old: VideoWithProfile[] | undefined) => {
        if (!old) return old;
        return old.map((video) => {
          if (video.id === videoId) {
            return {
              ...video,
              isBookmarked: !isBookmarked,
              bookmarks_count: isBookmarked ? video.bookmarks_count - 1 : video.bookmarks_count + 1,
            };
          }
          return video;
        });
      });
      
      return { previousVideos };
    },
    onError: (_err, { videoId, isBookmarked }, context) => {
      // Rollback on error
      if (context?.previousVideos) {
        queryClient.setQueryData(["videos"], context.previousVideos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};
