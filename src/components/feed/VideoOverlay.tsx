import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { VideoData } from "@/data/mockVideos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface VideoOverlayProps {
  video: VideoData;
}

const VideoOverlay = ({ video }: VideoOverlayProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(video.user.isFollowing);

  const handleFollowToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!video.userId) {
      return;
    }

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
  };

  const isOwnVideo = user?.id && video.userId ? user.id === video.userId : false;

  return (
    <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-20 video-overlay-gradient pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-foreground font-bold text-base">@{video.user.username}</span>
        {!isOwnVideo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFollowToggle();
            }}
            className={`pointer-events-auto px-3 py-0.5 rounded text-xs font-semibold transition ${
              isFollowing
                ? "bg-white/10 text-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <p className="text-foreground text-sm leading-snug mb-3 line-clamp-2">
        {video.description}
      </p>

      <div className="flex items-center gap-2 text-foreground text-xs">
        <Music className="w-3 h-3 animate-pulse-live" />
        <div className="overflow-hidden max-w-[200px]">
          <span className="inline-block whitespace-nowrap animate-marquee">
            {video.music}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;
