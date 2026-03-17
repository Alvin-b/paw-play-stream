import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { VideoData } from "@/data/mockVideos";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleLike, useToggleBookmark } from "@/hooks/useVideos";
import { useNavigate } from "react-router-dom";

interface InteractionSidebarProps {
  video: VideoData;
  onCommentClick: () => void;
  onShareClick: () => void;
}

const formatCount = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const InteractionSidebar = ({ video, onCommentClick, onShareClick }: InteractionSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toggleLikeMutation = useToggleLike();
  const toggleBookmarkMutation = useToggleBookmark();
  const [liked, setLiked] = useState(video.isLiked);
  const [bookmarked, setBookmarked] = useState(video.isBookmarked);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    toggleLikeMutation.mutate({ videoId: video.id, isLiked: wasLiked });
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    toggleBookmarkMutation.mutate({ videoId: video.id, isBookmarked: wasBookmarked });
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${video.user.username}`);
  };

  return (
    <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-6 max-w-[72px]">
      {/* Avatar */}
      <button onClick={handleProfileClick} className="relative mb-2">
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
      </button>

      {/* Like */}
      <button onClick={handleLike} className="flex flex-col items-center gap-1">
        <Heart className={`w-7 h-7 transition-colors ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
        <span className="text-foreground text-[11px] font-medium">{formatCount(likeCount)}</span>
      </button>

      {/* Comment */}
      <button onClick={(e) => { e.stopPropagation(); onCommentClick(); }} className="flex flex-col items-center gap-1">
        <MessageCircle className="w-7 h-7 text-foreground" />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.comments)}</span>
      </button>

      {/* Bookmark */}
      <button onClick={handleBookmark} className="flex flex-col items-center gap-1">
        <Bookmark className={`w-7 h-7 transition-colors ${bookmarked ? "fill-secondary text-secondary" : "text-foreground"}`} />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.bookmarks)}</span>
      </button>

      {/* Share */}
      <button onClick={(e) => { e.stopPropagation(); onShareClick(); }} className="flex flex-col items-center gap-1">
        <Share2 className="w-7 h-7 text-foreground" />
        <span className="text-foreground text-[11px] font-medium">{formatCount(video.shares)}</span>
      </button>

      {/* Music disc */}
      <div className="w-10 h-10 rounded-full bg-muted border-4 border-muted animate-spin-slow overflow-hidden">
        <img src={video.user.avatar} alt="Music" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default InteractionSidebar;
