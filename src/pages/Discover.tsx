import { useState, useEffect } from "react";
import { Search, X, TrendingUp, Flame, Music, Users, Play, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/navigation/BottomNav";

interface HashtagData {
  name: string;
  video_count: number;
  views_count: number;
  trend_direction?: "up" | "down" | "stable";
}

interface SoundData {
  id: string;
  title: string;
  audio_url: string;
  usage_count: number;
  creator: string;
}

interface ProfileData {
  username: string;
  display_name: string;
  avatar_url: string | null;
  followers_count: number;
  user_id: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  video_count: number;
}

const formatCount = (n: number) => {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const Discover = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"forYou" | "trending" | "sounds">("forYou");
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [sounds, setSounds] = useState<SoundData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchResults, setSearchResults] = useState<ProfileData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([
    { id: "1", name: "Dance", icon: "💃", video_count: 125000 },
    { id: "2", name: "Comedy", icon: "😂", video_count: 98000 },
    { id: "3", name: "Music", icon: "🎵", video_count: 87000 },
    { id: "4", name: "Food", icon: "🍕", video_count: 54000 },
    { id: "5", name: "Fitness", icon: "💪", video_count: 43000 },
    { id: "6", name: "Travel", icon: "✈️", video_count: 32000 },
    { id: "7", name: "Gaming", icon: "🎮", video_count: 28000 },
    { id: "8", name: "DIY", icon: "🎨", video_count: 21000 },
  ]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      // Fetch hashtags with trend direction (simulated)
      const { data: hashtagData } = await supabase
        .from("hashtags")
        .select("name, video_count, views_count")
        .order("views_count", { ascending: false })
        .limit(20);
      
      // Add simulated trend direction
      const hashtagsWithTrend = (hashtagData || []).map((tag, i) => ({
        ...tag,
        trend_direction: i < 5 ? "up" : i < 10 ? "stable" as const : "down" as const,
      }));
      setHashtags(hashtagsWithTrend);

      // Fetch profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, followers_count, user_id")
        .order("followers_count", { ascending: false })
        .limit(10);
      setProfiles(profileData || []);

      // Fetch sounds (from videos with audio)
      const { data: videosWithAudio } = await supabase
        .from("videos")
        .select("id, audio_url, music_name, user_id")
        .not("audio_url", "is", null)
        .limit(10);
      
      if (videosWithAudio) {
        const uniqueSounds = videosWithAudio.reduce((acc: SoundData[], vid) => {
          if (vid.music_name && !acc.find(s => s.title === vid.music_name)) {
            acc.push({
              id: vid.id,
              title: vid.music_name || "Original Sound",
              audio_url: vid.audio_url || "",
              usage_count: Math.floor(Math.random() * 10000) + 100,
              creator: "Unknown",
            });
          }
          return acc;
        }, []);
        setSounds(uniqueSounds);
      }
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

      {/* Category Tabs */}
      {!query.trim() && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              activeTab === "forYou" ? "bg-foreground text-background" : "bg-muted text-foreground"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
              activeTab === "trending" ? "bg-foreground text-background" : "bg-muted text-foreground"
            }`}
          >
            <Flame className="w-3 h-3" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab("sounds")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
              activeTab === "sounds" ? "bg-foreground text-background" : "bg-muted text-foreground"
            }`}
          >
            <Music className="w-3 h-3" />
            Sounds
          </button>
        </div>
      )}

      {activeTab === "forYou" && !query.trim() && (
        <div className="px-4 mt-2">
          {/* Categories Grid */}
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Categories
          </h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/discover?category=${cat.name}`)}
                className="aspect-square rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-foreground font-medium">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground">{formatCount(cat.video_count)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Tab */}
      {(activeTab === "trending" || !query.trim()) && hashtags.length > 0 && (
        <div className="px-4 mt-2">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Hashtags
          </h2>
          <div className="space-y-1">
            {hashtags.slice(0, 15).map((tag, index) => (
              <button
                key={tag.name}
                className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-foreground font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-foreground text-sm font-semibold">#{tag.name}</p>
                    <p className="text-muted-foreground text-xs">{formatCount(tag.views_count || 0)} views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tag.trend_direction === "up" && (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-muted-foreground text-xs">{formatCount(tag.video_count || 0)} videos</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sounds Tab */}
      {activeTab === "sounds" && (
        <div className="px-4 mt-2">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Trending Sounds
          </h2>
          {sounds.length > 0 ? (
            <div className="space-y-2">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">{sound.title}</p>
                      <p className="text-muted-foreground text-xs">by {sound.creator}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">{formatCount(sound.usage_count)} uses</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No sounds available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Accounts */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-3">
          {query.trim() ? "Search results" : "Top Creators"}
        </h2>
        {displayProfiles.length > 0 ? (
          <div className="space-y-1">
            {displayProfiles.slice(0, 10).map((account) => (
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
