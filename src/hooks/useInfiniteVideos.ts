import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useInfiniteVideos = (feedType: 'foryou' | 'following' = 'foryou') => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['videos', feedType],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          user:profiles!user_id (*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 9);

      if (feedType === 'following' && user) {
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = following?.map(f => f.following_id) || [];
        if (followingIds.length === 0) return { videos: [], nextCursor: null };
        query = query.in('user_id', followingIds);
      }

      const { data } = await query;
      if (!data || data.length === 0) return { videos: [], nextCursor: null };

      const enriched = data.map((v: any) => ({
        ...v,
        likes_count: v.likes_count || 0,
        comments_count: v.comments_count || 0,
        shares_count: v.shares_count || 0,
        bookmarks_count: v.bookmarks_count || 0,
        views_count: v.views_count || 0,
        user: v.user || { username: 'unknown', display_name: 'Unknown', avatar_url: null, verified: false },
        isLiked: false,
        isBookmarked: false,
      }));

      return { videos: enriched, nextCursor: pageParam + 10 };
    },
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor || undefined,
    initialPageParam: 0,
  });
};

