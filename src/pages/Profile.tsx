import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Share2, Grid3X3, Heart, Bookmark, Lock, LogOut, Menu, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/navigation/BottomNav";
import EditProfileModal from "@/components/profile/EditProfileModal";

interface VideoItem {
  id: string;
  video_url: string;
  views_count: number;
  thumbnail_url: string | null;
}

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"videos" | "private" | "bookmarked" | "liked">("videos");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoItem[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [{ data: vids }, { data: likes }, { data: bookmarks }] = await Promise.all([
        supabase.from("videos").select("id, video_url, views_count, thumbnail_url").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("likes").select("video_id").eq("user_id", user.id),
        supabase.from("bookmarks").select("video_id").eq("user_id", user.id),
      ]);
      setVideos(vids || []);
      if (likes && likes.length > 0) {
        const { data } = await supabase.from("videos").select("id, video_url, views_count, thumbnail_url").in("id", likes.map((l) => l.video_id));
        setLikedVideos(data || []);
      }
      if (bookmarks && bookmarks.length > 0) {
        const { data } = await supabase.from("videos").select("id, video_url, views_count, thumbnail_url").in("id", bookmarks.map((b) => b.video_id));
        setBookmarkedVideos(data || []);
      }
    };
    fetchAll();
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center pb-16">
        <div className="text-center px-8">
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Log in to see your profile</h2>
          <p className="text-muted-foreground text-sm mb-6">Create videos, follow accounts, and more.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">Log in</button>
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  const tabs = [
    { id: "videos" as const, icon: Grid3X3 },
    { id: "private" as const, icon: Lock },
    { id: "bookmarked" as const, icon: Bookmark },
    { id: "liked" as const, icon: Heart },
  ];

  const currentVideos = activeTab === "videos" ? videos : activeTab === "liked" ? likedVideos : activeTab === "bookmarked" ? bookmarkedVideos : [];
  const emptyMsg = activeTab === "videos" ? "Upload your first video" : activeTab === "liked" ? "Videos you liked" : activeTab === "bookmarked" ? "Saved videos" : "Private videos";

  return (
    <div className="min-h-dvh bg-background pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="w-8" />
        <button className="flex items-center gap-1">
          <span className="text-lg font-extrabold text-foreground">{profile.display_name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={() => setShowMenu(!showMenu)} className="relative">
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute right-4 top-12 z-50 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <button onClick={() => { setShowEditProfile(true); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-muted transition-colors">
            <Settings className="w-4 h-4 text-foreground" />
            <span className="text-foreground text-sm">Settings</span>
          </button>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-muted transition-colors">
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-destructive text-sm">Log out</span>
          </button>
        </div>
      )}

      {/* Profile info */}
      <div className="flex flex-col items-center py-3">
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-muted-foreground">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-2 border-background">
            <span className="text-secondary-foreground text-sm font-bold">+</span>
          </button>
        </div>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>

        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-foreground font-extrabold text-lg">{formatCount(profile.following_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Following</p>
          </div>
          <div className="text-center border-l border-r border-border px-6">
            <p className="text-foreground font-extrabold text-lg">{formatCount(profile.followers_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-foreground font-extrabold text-lg">{formatCount(profile.likes_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Likes</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowEditProfile(true)}
            className="px-6 py-2 rounded-lg bg-muted text-foreground text-sm font-bold"
          >
            Edit profile
          </button>
          <button className="px-3 py-2 rounded-lg bg-muted">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {profile.bio ? (
          <p className="text-foreground text-sm mt-3 px-8 text-center">{profile.bio}</p>
        ) : (
          <button className="mt-3 text-muted-foreground text-sm flex items-center gap-1">
            <span>+</span> Add bio
          </button>
        )}
      </div>

      {/* Tabs - matching TikTok reference */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
              activeTab === tab.id ? "border-foreground" : "border-transparent"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-foreground" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {currentVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-px">
          {currentVideos.map((v) => (
            <div key={v.id} className="aspect-[9/16] bg-card relative overflow-hidden">
              <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span className="text-foreground text-[10px] font-bold">{formatCount(v.views_count || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <p className="text-muted-foreground text-sm">{emptyMsg}</p>
        </div>
      )}

      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
