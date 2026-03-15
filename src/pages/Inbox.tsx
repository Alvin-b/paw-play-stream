import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/navigation/BottomNav";

interface Notification {
  id: string;
  type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  from_user: {
    username: string;
    avatar_url: string | null;
  } | null;
}

const iconMap: Record<string, any> = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  mention: AtSign,
};

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!data) { setLoading(false); return; }

      const fromUserIds = [...new Set(data.filter(n => n.from_user_id).map(n => n.from_user_id!))];
      let profileMap = new Map<string, { username: string; avatar_url: string | null }>();

      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", fromUserIds);
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      setNotifications(data.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        is_read: n.is_read || false,
        created_at: n.created_at,
        from_user: n.from_user_id ? (profileMap.get(n.from_user_id) || null) : null,
      })));
      setLoading(false);

      // Mark all as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    };

    fetchNotifications();

    // Realtime
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, async (payload) => {
        const n = payload.new as any;
        let from_user = null;
        if (n.from_user_id) {
          const { data: p } = await supabase.from("profiles").select("username, avatar_url").eq("user_id", n.from_user_id).single();
          from_user = p;
        }
        setNotifications(prev => [{
          id: n.id, type: n.type, message: n.message,
          is_read: false, created_at: n.created_at, from_user,
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center pb-16">
        <div className="text-center px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Notifications</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to see your notifications.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            Log in
          </button>
        </div>
        <BottomNav activeTab="inbox" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-xl font-bold text-foreground">Inbox</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Heart;
            return (
              <div
                key={notif.id}
                className={`flex items-center gap-3 px-4 py-3 ${!notif.is_read ? "bg-primary/5" : ""}`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-muted overflow-hidden">
                    {notif.from_user?.avatar_url ? (
                      <img src={notif.from_user.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {notif.from_user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Icon className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{notif.from_user?.username || "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{notif.message || notif.type}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav activeTab="inbox" />
    </div>
  );
};

export default Inbox;
