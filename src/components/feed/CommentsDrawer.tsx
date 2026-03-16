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
  parent_id: string | null;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentWithReplies extends Comment {
  replies: Comment[];
  isLiked: boolean;
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
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [count, setCount] = useState(commentsCount);

  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!commentsData) {
        setComments([]);
        return;
      }

      const commentIds = commentsData.map((c) => c.id);
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      const [{ data: profiles }, { data: likes }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds),
        user
          ? supabase
              .from("comment_likes")
              .select("comment_id")
              .eq("user_id", user.id)
              .in("comment_id", commentIds)
          : Promise.resolve({ data: [] as Array<{ comment_id: string }> }),
      ]);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      const likedSet = new Set(likes?.map((l) => l.comment_id) || []);

      const commentsById = new Map<string, CommentWithReplies>();

      commentsData.forEach((c) => {
        const p = profileMap.get(c.user_id);
        commentsById.set(c.id, {
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          likes_count: c.likes_count || 0,
          parent_id: c.parent_id,
          user: {
            username: p?.username || "unknown",
            avatar_url: p?.avatar_url || null,
          },
          replies: [],
          isLiked: likedSet.has(c.id),
        });
      });

      const topLevelComments: CommentWithReplies[] = [];

      commentsById.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentsById.get(comment.parent_id);
          if (parent) parent.replies.unshift(comment);
        } else {
          topLevelComments.push(comment);
        }
      });

      setComments(topLevelComments);
      setCount(commentsData.length);
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

        const newComment: CommentWithReplies = {
          id: newC.id,
          content: newC.content,
          created_at: newC.created_at,
          likes_count: 0,
          parent_id: newC.parent_id,
          user: {
            username: p?.username || "unknown",
            avatar_url: p?.avatar_url || "",
          },
          replies: [],
          isLiked: false,
        };

        setComments((prev) => {
          if (newComment.parent_id) {
            return prev.map((c) => {
              if (c.id === newComment.parent_id) {
                return { ...c, replies: [newComment, ...c.replies] };
              }
              return c;
            });
          }
          return [newComment, ...prev];
        });
        setCount((c) => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, videoId, user]);

  const toggleLike = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    if (isLiked) {
      await supabase.from("comment_likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
    } else {
      await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: commentId });
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: !isLiked,
            likes_count: c.likes_count + (isLiked ? -1 : 1),
          };
        }
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId
              ? { ...r, isLiked: !isLiked, likes_count: r.likes_count + (isLiked ? -1 : 1) }
              : r
          ),
        };
      })
    );
  };

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    const content = newComment.trim();
    setNewComment("");

    await supabase.from("comments").insert({
      video_id: videoId,
      user_id: user.id,
      content,
    });

    setCount((c) => c + 1);
  };

  const handleReplySend = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    const content = replyText.trim();
    setReplyText("");
    setReplyTo(null);

    await supabase.from("comments").insert({
      video_id: videoId,
      user_id: user.id,
      content,
      parent_id: parentId,
    });

    setCount((c) => c + 1);
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
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
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
                        <button
                          onClick={() => setReplyTo((prev) => (prev === comment.id ? null : comment.id))}
                          className="text-[10px] text-muted-foreground font-semibold"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLike(comment.id, comment.isLiked)}
                      className="flex flex-col items-center gap-0.5 pt-2"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          comment.isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground">{comment.likes_count}</span>
                    </button>
                  </div>

                  {replyTo === comment.id && (
                    <div className="ml-12 flex items-start gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleReplySend(comment.id)}
                        placeholder={user ? "Write a reply..." : "Log in to reply"}
                        disabled={!user}
                        className="flex-1 h-9 px-3 rounded-full bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none"
                      />
                      {replyText.trim() && (
                        <button onClick={() => handleReplySend(comment.id)}>
                          <Send className="w-5 h-5 text-primary" />
                        </button>
                      )}
                    </div>
                  )}

                  {comment.replies.length > 0 && (
                    <div className="ml-12 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                            {reply.user.avatar_url ? (
                              <img src={reply.user.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {reply.user.username[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-semibold">{reply.user.username}</p>
                            <p className="text-sm text-foreground mt-0.5">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                              <button
                                onClick={() => setReplyTo(reply.id)}
                                className="text-[10px] text-muted-foreground font-semibold"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleLike(reply.id, reply.isLiked)}
                            className="flex flex-col items-center gap-0.5 pt-2"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${
                                reply.isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span className="text-[10px] text-muted-foreground">{reply.likes_count}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
