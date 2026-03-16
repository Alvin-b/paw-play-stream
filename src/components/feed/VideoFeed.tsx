import { useState, useRef, useCallback, useEffect } from "react";
import { useVideos, VideoWithProfile } from "@/hooks/useVideos";
import { mockVideos, VideoData } from "@/data/mockVideos";
import VideoPlayer from "./VideoPlayer";
import FeedHeader from "./FeedHeader";

const VideoFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedType, setFeedType] = useState<"foryou" | "following">("foryou");
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { videos: dbVideos, loading, loadingMore, hasMore, loadMore } = useVideos(feedType);

  const videos: VideoData[] = dbVideos.length > 0
    ? dbVideos.map((v) => ({
        id: v.id,
        userId: v.user_id,
        user: {
          username: v.user.username,
          displayName: v.user.display_name,
          avatar: v.user.avatar_url || `https://i.pravatar.cc/150?u=${v.user.username}`,
          isFollowing: v.user.isFollowing,
        },
        description: v.description || "",
        music: v.music_name || "original sound",
        likes: v.likes_count,
        comments: v.comments_count,
        shares: v.shares_count,
        bookmarks: v.bookmarks_count,
        videoUrl: v.video_url,
        audioUrl: v.audio_url,
        isLiked: v.isLiked,
        isBookmarked: v.isBookmarked,
      }))
    : mockVideos;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    setActiveIndex(newIndex);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div className="relative w-full h-dvh max-w-lg mx-auto bg-background">
      <FeedHeader activeTab={feedType} onTabChange={setFeedType} />
      {loading && videos.length === 0 ? (
        <div className="h-dvh flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="snap-container"
        >
          {videos.map((video, index) => {
            const shouldLoad = Math.abs(index - activeIndex) <= 1;
            return (
              <VideoPlayer
                key={video.id}
                video={video}
                isActive={index === activeIndex}
                shouldLoad={shouldLoad}
              />
            );
          })}
          {hasMore && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {loadingMore ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-muted-foreground">Loading more...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
