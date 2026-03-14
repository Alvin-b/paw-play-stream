import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { VideoData } from "@/data/mockVideos";

interface InteractionSidebarProps {
  video: VideoData;
}

const formatCount = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const InteractionSidebar = ({ video }: InteractionSidebarProps) => {
  const [liked, setLiked] = useState(video.isLiked);
  const [bookmarked, setBookmarked] = useState(video.isBookmarked);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
      {/* Avatar */}
      <div className="relative mb-2">
        <img
          src={video.user.avatar}
          alt={video.user.username}
          className="w-11 h-11 rounded-full border-2 border-foreground object-cover"
        />
        {!video.user.isFollowing && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold leading-none">+</span>
          </div>
        )}
      </div>

      {/* Like */}
      <button onClick={handleLike} className="flex flex-col items-center gap-1">
        <Heart
          className={`w-7 h-7 transition-colors ${liked ? "fill-primary text-primary" : "text-foreground"}`}
        />
        <span className="text-foreground text-[11px] font-medium">{formatCount(likeCount)}</span>
      </button>

      {/* Comment */}
      <button onClick={stopProp} className="flex flex-col items-center gap-1">
        <MessageCircle className="w-7 h-7 text-foreground" />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.comments)}</span>
      </button>

      {/* Bookmark */}
      <button onClick={handleBookmark} className="flex flex-col items-center gap-1">
        <Bookmark
          className={`w-7 h-7 transition-colors ${bookmarked ? "fill-secondary text-secondary" : "text-foreground"}`}
        />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.bookmarks)}</span>
      </button>

      {/* Share */}
      <button onClick={stopProp} className="flex flex-col items-center gap-1">
        <Share2 className="w-7 h-7 text-foreground" />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.shares)}</span>
      </button>

      {/* Music disc */}
      <div className="w-10 h-10 rounded-full bg-muted border-4 border-muted animate-spin-slow overflow-hidden">
        <img
          src={video.user.avatar}
          alt="Music"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default InteractionSidebar;
