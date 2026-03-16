import { useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
  shouldLoad?: boolean;
}

const VideoPlayer = ({ video, isActive, shouldLoad = true }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTap = useRef(0);
  const watchStart = useRef<number>(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Handle touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const deltaX = touchEnd.x - touchStart.current.x;
    const deltaY = touchEnd.y - touchStart.current.y;
    
    // Swipe up - open comments (threshold: 50px vertical, less than 30px horizontal)
    if (deltaY < -50 && Math.abs(deltaX) < 30) {
      setShowComments(true);
    }
    // Swipe down - close comments if open
    else if (deltaY > 50 && Math.abs(deltaX) < 30 && showComments) {
      setShowComments(false);
    }
    
    touchStart.current = null;
  }, [showComments]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      watchStart.current = Date.now();
      
      // Track view count when video starts playing
      if (user) {
        // Use setTimeout to track view after 3 seconds (prevents double counting)
        const viewTimer = setTimeout(() => {
          supabase.from('videos').select('views_count').eq('id', video.id).single()
            .then(({ data }) => {
              if (data?.views_count !== undefined) {
                supabase.from('videos').update({ 
                  views_count: (data.views_count || 0) + 1 
                }).eq('id', video.id).then();
              }
            });
        }, 3000);
        return () => clearTimeout(viewTimer);
      }
      
      // Play audio if available
      if (audioRef.current && video.audioUrl) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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
  }, [isActive, user, video.id, video.audioUrl]);

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
      if (audioRef.current && video.audioUrl) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [video.audioUrl]); 

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 300) {
          if (isMuted) {
            setIsMuted(false);
          }
          togglePlay();
        }
      }, 300);
    }
    lastTap.current = now;
  }, [togglePlay, isMuted]);

  return (
    <div 
      className="snap-item relative w-full bg-background" 
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
      {video.audioUrl && (
        <audio
          ref={audioRef}
          src={shouldLoad ? video.audioUrl : undefined}
          loop
          muted={isMuted}
          preload={shouldLoad ? "auto" : "metadata"}
        />
      )}
      {/* Sound Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 right-4 z-30 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-foreground" />
        )}
      </button>

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
