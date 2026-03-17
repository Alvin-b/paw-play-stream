import { useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { VideoData } from "@/data/mockVideos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VideoOverlay from "./VideoOverlay";
import InteractionSidebar from "./InteractionSidebar";
import HeartBurst from "./HeartBurst";
import { useToggleLike } from "@/hooks/useVideos";
import React, { Suspense } from "react";
const CommentsDrawer = React.lazy(() => import("./CommentsDrawer"));
const ShareModal = React.lazy(() => import("./ShareModal"));

interface VideoPlayerProps {
  video: VideoData;
  isActive: boolean;
  shouldLoad?: boolean;
}

const VideoPlayer = ({ video, isActive, shouldLoad = true }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartPos, setHeartPos] = useState<{ x?: number; y?: number } | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTap = useRef(0);
  const watchStart = useRef<number>(0);
  const viewTracked = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const toggleLike = useToggleLike();
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
    if (e.key.toLowerCase() === "l") {
      e.preventDefault();
      toggleLike.mutate({ videoId: video.id, isLiked: video.isLiked });
      setShowHeart(true);
      setHeartPos(null);
      setTimeout(() => setShowHeart(false), 800);
    }
  }, [togglePlay, toggleLike, video.id, video.isLiked]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const deltaX = touchEnd.x - touchStart.current.x;
    const deltaY = touchEnd.y - touchStart.current.y;
    if (deltaY < -50 && Math.abs(deltaX) < 30) setShowComments(true);
    else if (deltaY > 50 && Math.abs(deltaX) < 30 && showComments) setShowComments(false);
    touchStart.current = null;
  }, [showComments]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      watchStart.current = Date.now();
      viewTracked.current = false;

      // Track view count after 3 seconds using server-side function
      const viewTimer = setTimeout(() => {
        if (!viewTracked.current && video.id) {
          viewTracked.current = true;
          supabase.rpc('increment_view_count', { vid_id: video.id }).then();
        }
      }, 3000);
      return () => clearTimeout(viewTimer);
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

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleTap = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    let clientX: number | undefined;
    let clientY: number | undefined;
    if (e && 'changedTouches' in e && e.changedTouches?.[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e && 'clientX' in e) {
      const me = e as React.MouseEvent;
      clientX = me.clientX;
      clientY = me.clientY;
    }

    if (now - lastTap.current < 300) {
      setShowHeart(true);
      if (clientX !== undefined && clientY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setHeartPos({
          x: Math.max(48, Math.min(rect.width - 48, clientX - rect.left)),
          y: Math.max(48, Math.min(rect.height - 48, clientY - rect.top)),
        });
      } else {
        setHeartPos(null);
      }
      setTimeout(() => { setShowHeart(false); setHeartPos(null); }, 800);
      toggleLike.mutate({ videoId: video.id, isLiked: video.isLiked });
    } else {
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 300) {
          if (isMuted) setIsMuted(false);
          togglePlay();
        }
      }, 300);
    }
    lastTap.current = now;
  }, [togglePlay, isMuted, toggleLike, video.id, video.isLiked]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="snap-item relative w-full bg-background"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-active={isActive}
      aria-label={`video-${video.id}`}
    >
      <video
        ref={videoRef}
        src={shouldLoad ? video.videoUrl : undefined}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload={shouldLoad ? "auto" : "metadata"}
        onTimeUpdate={handleTimeUpdate}
      />
      <button
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute top-4 right-4 z-30 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}
      </button>

      <div className="absolute bottom-[56px] left-0 right-0 z-30 h-[3px] bg-foreground/20 cursor-pointer" onClick={handleProgressClick}>
        <div className="h-full bg-foreground/80 transition-[width] duration-100" style={{ width: `${progress}%` }} />
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

      {showHeart && <HeartBurst x={heartPos?.x} y={heartPos?.y} />}
      <VideoOverlay video={video} />
      <InteractionSidebar video={video} onCommentClick={() => setShowComments(true)} onShareClick={() => setShowShare(true)} />
      <Suspense fallback={null}>
        {showComments && (
          <CommentsDrawer videoId={video.id} commentsCount={video.comments} isOpen={showComments} onClose={() => setShowComments(false)} />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {showShare && <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} videoId={video.id} videoUrl={video.videoUrl} videoDescription={video.description} />}
      </Suspense>
    </div>
  );
};

export default VideoPlayer;
