import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Image } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";

interface Conversation {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recipientId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientProfile, setRecipientProfile] = useState<{ username: string; avatar_url: string | null; display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations list
  useEffect(() => {
    if (!user || recipientId) return;

    const fetchConversations = async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) { setLoading(false); return; }

      // Group by conversation partner
      const convMap = new Map<string, { last_message: string; last_message_at: string; unread: number }>();
      for (const msg of msgs) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread: (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0,
          });
        } else if (!msg.is_read && msg.receiver_id === user.id) {
          const existing = convMap.get(partnerId)!;
          existing.unread++;
        }
      }

      const partnerIds = [...convMap.keys()];
      if (partnerIds.length === 0) { setConversations([]); setLoading(false); return; }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const convList: Conversation[] = partnerIds.map(id => {
        const conv = convMap.get(id)!;
        const p = profileMap.get(id);
        return {
          user_id: id,
          username: p?.username || "unknown",
          display_name: p?.display_name || "Unknown",
          avatar_url: p?.avatar_url || null,
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread,
        };
      });

      convList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(convList);
      setLoading(false);
    };

    fetchConversations();
  }, [user, recipientId]);

  // Fetch messages for a specific conversation
  useEffect(() => {
    if (!user || !recipientId) return;

    const fetchMessages = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url, display_name")
        .eq("user_id", recipientId)
        .single();
      setRecipientProfile(profile);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setLoading(false);

      // Mark as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", recipientId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    };

    fetchMessages();

    // Realtime
    const channel = supabase
      .channel(`dm-${recipientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === recipientId) ||
          (msg.sender_id === recipientId && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg]);
          // Mark as read if received
          if (msg.sender_id === recipientId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, recipientId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !recipientId) return;
    const content = newMessage.trim();
    setNewMessage("");
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: recipientId,
      content,
    });
  };

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center pb-16">
        <div className="text-center px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Messages</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to send messages.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Log in</button>
        </div>
        <BottomNav activeTab="inbox" />
      </div>
    );
  }

  // Chat view
  if (recipientId) {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button onClick={() => navigate("/messages")}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0">
            {recipientProfile?.avatar_url ? (
              <img src={recipientProfile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                {recipientProfile?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm truncate">{recipientProfile?.username || "..."}</p>
            <p className="text-muted-foreground text-xs truncate">{recipientProfile?.display_name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-border flex items-center gap-3 shrink-0">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Send a message..."
            className="flex-1 h-10 px-4 rounded-full bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          {newMessage.trim() && (
            <button onClick={handleSend} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="px-4 pt-3 pb-2 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Messages</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <p className="text-muted-foreground text-sm text-center">No messages yet</p>
          <p className="text-muted-foreground text-xs text-center mt-1">Start a conversation from someone's profile</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => navigate(`/messages/${conv.user_id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                {conv.avatar_url ? (
                  <img src={conv.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {conv.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-foreground font-semibold text-sm truncate">{conv.username}</p>
                <p className="text-muted-foreground text-xs truncate">{conv.last_message} · {timeAgo(conv.last_message_at)}</p>
              </div>
              {conv.unread_count > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-[10px] font-bold">{conv.unread_count}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <BottomNav activeTab="inbox" />
    </div>
  );
};

export default Messages;
