import { useState, useEffect } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/navigation/BottomNav";

interface HashtagData {
  name: string;
  video_count: number;
  views_count: number;
}

interface ProfileData {
  username: string;
  display_name: string;
  avatar_url: string | null;
  followers_count: number;
  user_id: string;
}

const formatCount = (n: number) => {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const Discover = () => {
  const [query, setQuery] = useState("");
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchResults, setSearchResults] = useState<ProfileData[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      const { data: hashtagData } = await supabase
        .from("hashtags")
        .select("name, video_count, views_count")
        .order("views_count", { ascending: false })
        .limit(15);
      setHashtags(hashtagData || []);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, followers_count, user_id")
        .order("followers_count", { ascending: false })
        .limit(10);
      setProfiles(profileData || []);
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, followers_count, user_id")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);
      setSearchResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFollow = async (userId: string) => {
    if (!user) { navigate("/login"); return; }
    await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
  };

  const displayProfiles = query.trim() ? searchResults : profiles;

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search accounts, sounds, hashtags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-full bg-muted text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Trending Hashtags */}
      {!query.trim() && hashtags.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending
          </h2>
          <div className="space-y-1">
            {hashtags.map((tag) => (
              <button
                key={tag.name}
                className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-foreground font-bold text-sm">#</span>
                  </div>
                  <div className="text-left">
                    <p className="text-foreground text-sm font-semibold">#{tag.name}</p>
                    <p className="text-muted-foreground text-xs">{formatCount(tag.views_count || 0)} views</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">{formatCount(tag.video_count || 0)} videos</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Accounts */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-3">
          {query.trim() ? "Search results" : "Suggested accounts"}
        </h2>
        {displayProfiles.length > 0 ? (
          <div className="space-y-1">
            {displayProfiles.map((account) => (
              <div key={account.user_id} className="flex items-center justify-between py-3 px-2">
                <button
                  onClick={() => navigate(`/user/${account.username}`)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-11 h-11 rounded-full bg-muted overflow-hidden shrink-0">
                    {account.avatar_url ? (
                      <img src={account.avatar_url} alt={account.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {account.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">{account.username}</p>
                    <p className="text-muted-foreground text-xs truncate">{account.display_name} · {formatCount(account.followers_count || 0)} followers</p>
                  </div>
                </button>
                {user?.id !== account.user_id && (
                  <button
                    onClick={() => handleFollow(account.user_id)}
                    className="px-5 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold shrink-0"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            {query.trim() ? "No results found" : "No accounts yet"}
          </p>
        )}
      </div>

      <BottomNav activeTab="discover" />
    </div>
  );
};

export default Discover;
