import { Music } from "lucide-react";
import { VideoData } from "@/data/mockVideos";

interface VideoOverlayProps {
  video: VideoData;
}

const VideoOverlay = ({ video }: VideoOverlayProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-20 video-overlay-gradient pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-foreground font-bold text-base">@{video.user.username}</span>
        {!video.user.isFollowing && (
          <button className="pointer-events-auto px-3 py-0.5 border border-primary rounded text-primary text-xs font-semibold">
            Follow
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
