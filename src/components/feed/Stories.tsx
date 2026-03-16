import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Heart, MessageCircle, Send, Image, Camera, Music, ChevronLeft, ChevronRight, Smile } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  duration: number;
  created_at: string;
  expires_at: string;
  views_count: number;
}

interface StoriesViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

const StoriesViewer = ({ stories, initialIndex = 0, onClose }: StoriesViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const { user, profile } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentIndex];
  const isLastStory = currentIndex === stories.length - 1;
  const isFirstStory = currentIndex === 0;

  useEffect(() => {
    if (!isPaused && currentStory) {
      const duration = currentStory.duration || 5000;
      const interval = 50;
      const increment = (interval / duration) * 100;
      
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (isLastStory) {
              onClose();
              return prev;
            }
            setCurrentIndex((idx) => idx + 1);
            setProgress(0);
            return 0;
          }
          return prev + increment;
        });
      }, interval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex, currentStory, isLastStory]);

  const handleNext = () => {
    if (isLastStory) {
      onClose();
    } else {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (isFirstStory) {
      setProgress(0);
    } else {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error("Please log in to like");
      return;
    }
    setLikes((prev) => ({ ...prev, [currentStory.id]: !prev[currentStory.id] }));
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast.success("Reply sent!");
    setReplyText("");
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    
    if (x < width / 3) {
      handlePrev();
    } else if (x > (width / 3) * 2) {
      handleNext();
    } else {
      setIsPaused(!isPaused);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress Bars */}
      <div className="absolute top-4 left-2 right-2 z-20 flex gap-1">
        {stories.map((story, idx) => (
          <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ 
                width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" 
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Content */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={handleTap}
      >
        {currentStory.media_type === "video" ? (
          <video
            src={currentStory.media_url}
            className="w-full h-full object-contain"
            autoPlay
            muted
            loop={isPaused}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Top Bar - User Info */}
      <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">U</span>
          </div>
          <span className="text-white text-sm font-semibold">username</span>
          <span className="text-white/60 text-xs">2h ago</span>
        </div>
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        {/* Reply Input */}
        <div className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Send message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none"
          />
          <button onClick={handleSendReply} disabled={!replyText.trim()}>
            <Send className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="text-white">
              <Heart className={`w-7 h-7 ${likes[currentStory.id] ? "fill-red-500 text-red-500" : ""}`} />
            </button>
            <button className="text-white">
              <MessageCircle className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stories Creation Component
export const StoryCreator = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMedia(url);
    setMediaType(file.type.startsWith("video") ? "video" : "image");
  };

  const handleUpload = async () => {
    if (!media || !user) return;
    
    setLoading(true);
    try {
      // In production, upload to Supabase storage
      toast.success("Story posted!");
      setMedia(null);
    } catch (error) {
      toast.error("Failed to post story");
    } finally {
      setLoading(false);
    }
  };

  if (media) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <button onClick={() => setMedia(null)}>
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-sm font-semibold">Preview</span>
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {mediaType === "video" ? (
          <video src={media} className="w-full h-full object-contain" />
        ) : (
          <img src={media} alt="Preview" className="w-full h-full object-contain" />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-foreground">Create Story</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[9/16] rounded-xl bg-muted flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
        >
          <Image className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Photo</span>
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[9/16] rounded-xl bg-muted flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
        >
          <Camera className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Video</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default StoriesViewer;
