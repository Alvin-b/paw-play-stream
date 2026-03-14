import { useState, useRef, useCallback } from "react";
import { mockVideos } from "@/data/mockVideos";
import VideoPlayer from "./VideoPlayer";
import FeedHeader from "./FeedHeader";

const VideoFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    setActiveIndex(newIndex);
  }, []);

  return (
    <div className="relative w-full h-dvh max-w-lg mx-auto bg-background">
      <FeedHeader />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="snap-container"
      >
        {mockVideos.map((video, index) => (
          <VideoPlayer
            key={video.id}
            video={video}
            isActive={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;
