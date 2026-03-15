import { useState, useEffect } from "react";
import { X, Send, Heart } from "lucide-react";
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

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const CommentsDrawer = ({ videoId, commentsCount, isOpen, onClose }: CommentsDrawerProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [count, setCount] = useState(commentsCount);

  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("video_id", videoId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      setComments(
        commentsData.map((c) => {
          const p = profileMap.get(c.user_id);
          return {
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            likes_count: c.likes_count || 0,
            user: {
              username: p?.username || "unknown",
              avatar_url: p?.avatar_url || "",
            },
          };
        })
      );
    };

    fetchComments();

    // Realtime subscription
    const channel = supabase
      .channel(`comments-${videoId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `video_id=eq.${videoId}`,
      }, async (payload) => {
        const newC = payload.new as any;
        const { data: p } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("user_id", newC.user_id)
          .single();

        setComments((prev) => [{
          id: newC.id,
          content: newC.content,
          created_at: newC.created_at,
          likes_count: 0,
          user: { username: p?.username || "unknown", avatar_url: p?.avatar_url || "" },
        }, ...prev]);
        setCount((c) => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, videoId]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    const content = newComment.trim();
    setNewComment("");

    await supabase.from("comments").insert({
      video_id: videoId,
      user_id: user.id,
      content,
    });
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-foreground font-semibold text-sm">{count} comments</span>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
                </div>
              )}
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
                      <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
                      <button className="text-[10px] text-muted-foreground font-semibold">Reply</button>
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-0.5 pt-2">
                    <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{comment.likes_count}</span>
                  </button>
                </div>
              ))}
            </div>

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
