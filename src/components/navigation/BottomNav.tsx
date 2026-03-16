import { Home, Users, Plus, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BottomNavProps {
  activeTab?: string;
}

const BottomNav = ({ activeTab = "home" }: BottomNavProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadNotifs(count || 0);
    };
    fetchUnread();

    const channel = supabase
      .channel("nav-notifs")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setUnreadNotifs((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "friends", label: "Friends", icon: Users, path: "/discover" },
    { id: "create", label: "", icon: Plus, path: "/upload" },
    { id: "inbox", label: "Inbox", icon: MessageSquare, path: "/inbox", badge: unreadNotifs },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.id === "create") {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex items-center justify-center"
              >
                <div className="w-12 h-8 rounded-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-10 rounded-lg bg-secondary" />
                  <div className="absolute right-0 top-0 bottom-0 w-10 rounded-lg bg-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-full bg-foreground rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-background" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5"
            >
              <div className="relative">
                <item.icon
                  className={`w-6 h-6 transition-colors ${
                    activeTab === item.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-primary flex items-center justify-center px-1">
                    <span className="text-primary-foreground text-[9px] font-bold">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`text-[10px] transition-colors ${
                  activeTab === item.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
