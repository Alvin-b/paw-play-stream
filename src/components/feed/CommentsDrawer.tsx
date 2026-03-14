import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user: {
    username: string;
    avatar_url: string;
  };
}

interface CommentsDrawerProps {
  videoId: string;
  commentsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsDrawer = ({ videoId, commentsCount, isOpen, onClose }: CommentsDrawerProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock comments for now (will use real data when videos exist)
  useEffect(() => {
    if (isOpen) {
      setComments([
        { id: "1", content: "This is amazing! 🔥", created_at: "2h ago", likes_count: 234, user: { username: "dancequeen", avatar_url: "https://i.pravatar.cc/150?img=20" } },
        { id: "2", content: "Teach me how to do this please 🙏", created_at: "3h ago", likes_count: 45, user: { username: "newbie_creator", avatar_url: "https://i.pravatar.cc/150?img=30" } },
        { id: "3", content: "Song name?", created_at: "5h ago", likes_count: 12, user: { username: "musiclover", avatar_url: "https://i.pravatar.cc/150?img=31" } },
        { id: "4", content: "POV: You found this at 3am 😂", created_at: "8h ago", likes_count: 567, user: { username: "nightowl", avatar_url: "https://i.pravatar.cc/150?img=32" } },
        { id: "5", content: "Following for more content like this", created_at: "1d ago", likes_count: 23, user: { username: "superfan", avatar_url: "https://i.pravatar.cc/150?img=33" } },
      ]);
    }
  }, [isOpen, videoId]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      created_at: "Just now",
      likes_count: 0,
      user: { username: profile?.username || "you", avatar_url: profile?.avatar_url || "" },
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-foreground font-semibold text-sm">{commentsCount} comments</span>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0">
                    {comment.user.avatar_url ? (
                      <img src={comment.user.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {comment.user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold">{comment.user.username}</p>
                    <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground">{comment.created_at}</span>
                      <button className="text-[10px] text-muted-foreground font-semibold">Reply</button>
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-0.5 pt-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">{comment.likes_count}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {user ? (profile?.username?.[0]?.toUpperCase() || "U") : "?"}
                  </div>
                )}
              </div>
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={user ? "Add comment..." : "Log in to comment"}
                disabled={!user}
                className="flex-1 h-9 px-3 rounded-full bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none"
              />
              {newComment.trim() && (
                <button onClick={handleSend}>
                  <Send className="w-5 h-5 text-primary" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsDrawer;
