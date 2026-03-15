import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Share2, Grid3X3, Heart, Bookmark, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/navigation/BottomNav";
import EditProfileModal from "@/components/profile/EditProfileModal";

interface VideoItem {
  id: string;
  video_url: string;
  views_count: number;
  thumbnail_url: string | null;
}

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"videos" | "liked" | "bookmarked">("videos");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoItem[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserVideos = async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, video_url, views_count, thumbnail_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setVideos(data || []);
    };

    const fetchLikedVideos = async () => {
      const { data: likes } = await supabase
        .from("likes")
        .select("video_id")
        .eq("user_id", user.id);
      
      if (likes && likes.length > 0) {
        const videoIds = likes.map(l => l.video_id);
        const { data } = await supabase
          .from("videos")
          .select("id, video_url, views_count, thumbnail_url")
          .in("id", videoIds);
        setLikedVideos(data || []);
      }
    };

    const fetchBookmarkedVideos = async () => {
      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("video_id")
        .eq("user_id", user.id);
      
      if (bookmarks && bookmarks.length > 0) {
        const videoIds = bookmarks.map(b => b.video_id);
        const { data } = await supabase
          .from("videos")
          .select("id, video_url, views_count, thumbnail_url")
          .in("id", videoIds);
        setBookmarkedVideos(data || []);
      }
    };

    fetchUserVideos();
    fetchLikedVideos();
    fetchBookmarkedVideos();
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center pb-16">
        <div className="text-center px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Log in to see your profile</h2>
          <p className="text-muted-foreground text-sm mb-6">Create videos, follow accounts, and more.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            Log in
          </button>
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const tabs = [
    { id: "videos" as const, icon: Grid3X3, label: "Videos" },
    { id: "liked" as const, icon: Heart, label: "Liked" },
    { id: "bookmarked" as const, icon: Bookmark, label: "Saved" },
  ];

  const currentVideos = activeTab === "videos" ? videos : activeTab === "liked" ? likedVideos : bookmarkedVideos;
  const emptyMessage = activeTab === "videos" ? "Upload your first video" : activeTab === "liked" ? "Videos you liked will appear here" : "Saved videos will appear here";

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-lg font-bold text-foreground">@{profile.username}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditProfile(true)}>
            <Settings className="w-6 h-6 text-foreground" />
          </button>
          <button onClick={handleSignOut}>
            <LogOut className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center py-4">
        <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mb-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {profile.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="text-foreground font-semibold text-base">@{profile.username}</h2>

        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{formatCount(profile.following_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{formatCount(profile.followers_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{formatCount(profile.likes_count || 0)}</p>
            <p className="text-muted-foreground text-xs">Likes</p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mt-3 px-8 text-center">
          {profile.bio || "No bio yet."}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowEditProfile(true)}
            className="px-6 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold"
          >
            Edit profile
          </button>
          <button className="px-3 py-2 rounded-lg bg-muted">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

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

      {currentVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {currentVideos.map((v) => (
            <div key={v.id} className="aspect-[9/16] bg-muted relative overflow-hidden">
              <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span className="text-foreground text-[10px] font-medium">{formatCount(v.views_count || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-16 px-8">
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      )}

      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
