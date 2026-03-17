import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { VideoData } from "@/data/mockVideos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface VideoOverlayProps {
  video: VideoData;
}

// TikTok-like bottom-left overlay: username + follow button, caption, hashtags, and music marquee
export default function VideoOverlay({ video }: VideoOverlayProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(video.user.isFollowing);

  const handleFollowToggle = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!video.userId) return;

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", video.userId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: video.userId,
        });
        setIsFollowing(true);
      }
    } catch (err) {
      // Silently fail; UI will update optimistically
      console.error(err);
    }
  };

  const isOwnVideo = user?.id && video.userId ? user.id === video.userId : false;

  return (
    <div className="absolute bottom-0 left-0 right-16 z-30 p-4 pb-28 video-overlay-gradient pointer-events-none">
      <div className="pointer-events-auto max-w-[70%]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/user/${video.user.username}`); }}
            className="flex items-center gap-3"
            aria-label={`Go to ${video.user.username}`}
          >
            <img src={video.user.avatar} alt={video.user.username} className="w-10 h-10 rounded-full object-cover border-2 border-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold text-base">@{video.user.username}</span>
                <span className="text-foreground/70 text-sm">{video.user.displayName}</span>
              </div>
              <div className="text-foreground/70 text-sm">{(video.user as any).verified ? "Verified" : ""}</div>
            </div>
          </button>

          {!isOwnVideo && (
            <button
              onClick={handleFollowToggle}
              className={`ml-2 pointer-events-auto px-3 py-1 rounded-full text-sm font-semibold transition ${isFollowing ? "bg-white/10 text-foreground" : "bg-primary text-primary-foreground"}`}
              aria-pressed={isFollowing}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="mb-3">
          <p className="text-foreground text-sm leading-snug whitespace-pre-wrap">{video.description}</p>
        </div>

        <div className="flex items-center gap-3 text-foreground text-sm">
          <Music className="w-4 h-4 animate-pulse-live" />
          <div className="overflow-hidden">
            <div className="inline-block whitespace-nowrap animate-marquee">
              {video.music}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
