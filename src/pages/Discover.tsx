import { useState } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";

const trendingHashtags = [
  { name: "fyp", views: "142.5B", videoCount: "12.4M" },
  { name: "viral", views: "98.2B", videoCount: "8.1M" },
  { name: "dance", views: "67.8B", videoCount: "5.2M" },
  { name: "comedy", views: "54.3B", videoCount: "4.8M" },
  { name: "cooking", views: "43.1B", videoCount: "3.9M" },
  { name: "fitness", views: "38.7B", videoCount: "3.2M" },
  { name: "music", views: "35.2B", videoCount: "2.8M" },
  { name: "travel", views: "29.4B", videoCount: "2.1M" },
  { name: "fashion", views: "24.8B", videoCount: "1.9M" },
  { name: "pets", views: "21.3B", videoCount: "1.7M" },
];

const suggestedAccounts = [
  { username: "dancequeen", displayName: "Dance Queen 💃", avatar: "https://i.pravatar.cc/150?img=20", followers: "2.4M" },
  { username: "chef_master", displayName: "Chef Master", avatar: "https://i.pravatar.cc/150?img=21", followers: "1.8M" },
  { username: "travelwith_me", displayName: "Travel With Me ✈️", avatar: "https://i.pravatar.cc/150?img=22", followers: "956K" },
  { username: "fitlife", displayName: "Fit Life", avatar: "https://i.pravatar.cc/150?img=23", followers: "1.2M" },
];

const Discover = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-dvh bg-background pb-16">
      {/* Search bar */}
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
      <div className="px-4 mt-4">
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending
        </h2>
        <div className="space-y-1">
          {trendingHashtags
            .filter((h) => !query || h.name.includes(query.toLowerCase()))
            .map((tag) => (
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
                    <p className="text-muted-foreground text-xs">{tag.views} views</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">{tag.videoCount} videos</span>
              </button>
            ))}
        </div>
      </div>

      {/* Suggested Accounts */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Suggested accounts</h2>
        <div className="space-y-1">
          {suggestedAccounts.map((account) => (
            <div key={account.username} className="flex items-center justify-between py-3 px-2">
              <div className="flex items-center gap-3">
                <img src={account.avatar} alt={account.username} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-foreground text-sm font-semibold">{account.username}</p>
                  <p className="text-muted-foreground text-xs">{account.displayName} · {account.followers}</p>
                </div>
              </div>
              <button className="px-5 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav activeTab="discover" />
    </div>
  );
};

export default Discover;
