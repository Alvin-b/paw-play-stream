import { useRef, useEffect, useState, useCallback } from "react";
import { VideoData } from "@/data/mockVideos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTap = useRef(0);
  const watchStart = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      watchStart.current = Date.now();
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      // Track watch history
      if (user && watchStart.current > 0) {
        const duration = Math.floor((Date.now() - watchStart.current) / 1000);
        if (duration > 1) {
          supabase.from("watch_history").insert({
            user_id: user.id,
            video_id: video.id,
            watch_duration_seconds: duration,
            completed: duration >= (videoRef.current?.duration || 999),
          }).then(() => {});
        }
        watchStart.current = 0;
      }
    }
  }, [isActive, user, video.id]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  }, []);

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
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Progress bar */}
      <div
        className="absolute bottom-[56px] left-0 right-0 z-30 h-[3px] bg-foreground/20 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-foreground/80 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

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
