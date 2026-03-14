import { useRef, useEffect, useState, useCallback } from "react";
import { VideoData } from "@/data/mockVideos";
import VideoOverlay from "./VideoOverlay";
import InteractionSidebar from "./InteractionSidebar";
import HeartBurst from "./HeartBurst";
import CommentsDrawer from "./CommentsDrawer";
import ShareModal from "./ShareModal";

interface VideoPlayerProps {
  video: VideoData;
  isActive: boolean;
}

const VideoPlayer = ({ video, isActive }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 300) {
          togglePlay();
        }
      }, 300);
    }
    lastTap.current = now;
  }, [togglePlay]);

  return (
    <div className="snap-item relative w-full bg-background" onClick={handleTap}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="auto"
      />

      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-1">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      )}

      {showHeart && <HeartBurst />}
      <VideoOverlay video={video} />
      <InteractionSidebar
        video={video}
        onCommentClick={() => setShowComments(true)}
        onShareClick={() => setShowShare(true)}
      />
      <CommentsDrawer
        videoId={video.id}
        commentsCount={video.comments}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
};

export default VideoPlayer;
