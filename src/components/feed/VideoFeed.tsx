import { useState, useRef, useCallback } from "react";
import { useVideos, VideoWithProfile } from "@/hooks/useVideos";
import { mockVideos, VideoData } from "@/data/mockVideos";
import VideoPlayer from "./VideoPlayer";
import FeedHeader from "./FeedHeader";

const VideoFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedType, setFeedType] = useState<"foryou" | "following">("foryou");
  const containerRef = useRef<HTMLDivElement>(null);
  const { videos: dbVideos, loading } = useVideos(feedType);

  // Convert DB videos to the VideoData format, fallback to mock if no DB videos
  const videos: VideoData[] = dbVideos.length > 0
    ? dbVideos.map((v) => ({
        id: v.id,
        user: {
          username: v.user.username,
          displayName: v.user.display_name,
          avatar: v.user.avatar_url || `https://i.pravatar.cc/150?u=${v.user.username}`,
          isFollowing: false,
        },
        description: v.description || "",
        music: v.music_name || "original sound",
        likes: v.likes_count,
        comments: v.comments_count,
        shares: v.shares_count,
        bookmarks: v.bookmarks_count,
        videoUrl: v.video_url,
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
          {videos.map((video, index) => (
            <VideoPlayer
              key={video.id}
              video={video}
              isActive={index === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
