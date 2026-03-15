import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Share2, Grid3X3 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import BottomNav from "@/components/navigation/BottomNav";

interface VideoItem {
  id: string;
  video_url: string;
  views_count: number;
}

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username || "")
        .single();
      setProfile(data);

      if (data) {
        // Fetch user videos
        const { data: vids } = await supabase
          .from("videos")
          .select("id, video_url, views_count")
          .eq("user_id", data.user_id)
          .eq("is_public", true)
          .order("created_at", { ascending: false });
        setVideos(vids || []);

        if (user) {
          const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", data.user_id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username, user]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
      setIsFollowing(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
        <span className="text-lg font-bold text-foreground flex-1">@{profile.username}</span>
        <Share2 className="w-5 h-5 text-foreground" />
      </div>

      <div className="flex flex-col items-center py-4">
        <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mb-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {profile.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="text-foreground font-semibold">{profile.display_name}</h2>

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

        <p className="text-muted-foreground text-sm mt-3 px-8 text-center">{profile.bio || "No bio yet."}</p>

        {!isOwnProfile && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFollow}
              className={`px-8 py-2 rounded-lg text-sm font-semibold ${
                isFollowing
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold">
              Message
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-border">
        <button className="flex-1 flex items-center justify-center py-3 border-b-2 border-foreground">
          <Grid3X3 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {videos.map((v) => (
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
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">No videos yet</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default UserProfile;
