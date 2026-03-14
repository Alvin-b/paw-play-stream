import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";

const mockNotifications = [
  { id: "1", type: "like", username: "dancequeen", avatar: "https://i.pravatar.cc/150?img=20", text: "liked your video", time: "2h" },
  { id: "2", type: "follow", username: "chef_master", avatar: "https://i.pravatar.cc/150?img=21", text: "started following you", time: "4h" },
  { id: "3", type: "comment", username: "travelwith_me", avatar: "https://i.pravatar.cc/150?img=22", text: "commented: This is amazing! 🔥", time: "6h" },
  { id: "4", type: "mention", username: "fitlife", avatar: "https://i.pravatar.cc/150?img=23", text: "mentioned you in a comment", time: "1d" },
  { id: "5", type: "like", username: "musicfan99", avatar: "https://i.pravatar.cc/150?img=24", text: "liked your video", time: "1d" },
  { id: "6", type: "follow", username: "artcreator", avatar: "https://i.pravatar.cc/150?img=25", text: "started following you", time: "2d" },
];

const iconMap = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  mention: AtSign,
};

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

      <div className="divide-y divide-border">
        {mockNotifications.map((notif) => {
          const Icon = iconMap[notif.type as keyof typeof iconMap] || Heart;
          return (
            <div key={notif.id} className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <img src={notif.avatar} alt={notif.username} className="w-11 h-11 rounded-full object-cover" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Icon className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{notif.username}</span>{" "}
                  <span className="text-muted-foreground">{notif.text}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav activeTab="inbox" />
    </div>
  );
};

export default Inbox;
