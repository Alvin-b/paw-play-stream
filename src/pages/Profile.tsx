import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Share2, Grid3X3, Heart, Bookmark, LogOut } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";
import EditProfileModal from "@/components/profile/EditProfileModal";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"videos" | "liked" | "bookmarked">("videos");
  const [showEditProfile, setShowEditProfile] = useState(false);

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

  return (
    <div className="min-h-dvh bg-background pb-16">
      {/* Header */}
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

      {/* Profile Info */}
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

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{profile.following_count || 0}</p>
            <p className="text-muted-foreground text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{profile.followers_count || 0}</p>
            <p className="text-muted-foreground text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-foreground font-bold text-lg">{profile.likes_count || 0}</p>
            <p className="text-muted-foreground text-xs">Likes</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-muted-foreground text-sm mt-3 px-8 text-center">
          {profile.bio || "No bio yet."}
        </p>

        {/* Edit Profile & Share */}
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

      {/* Tabs */}
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

      {/* Content */}
      <div className="flex items-center justify-center py-16 px-8">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {activeTab === "videos" && "Upload your first video"}
            {activeTab === "liked" && "Videos you liked will appear here"}
            {activeTab === "bookmarked" && "Saved videos will appear here"}
          </p>
        </div>
      </div>

      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
