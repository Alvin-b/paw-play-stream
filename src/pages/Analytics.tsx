import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Users, Clock, Video, DollarSign, BarChart3, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalVideos: number;
  avgWatchTime: number;
  engagementRate: number;
  revenue: number;
}

interface VideoStats {
  id: string;
  thumbnail: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  date: string;
}

interface TrendData {
  label: string;
  value: number;
  change: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const Analytics = () => {
  const { user, profile } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);
  
  // Sample analytics data
  const [analytics] = useState<AnalyticsData>({
    totalViews: 1250000,
    totalLikes: 89500,
    totalComments: 12300,
    totalShares: 8900,
    totalFollowers: 4520,
    totalVideos: 89,
    avgWatchTime: 45,
    engagementRate: 8.7,
    revenue: 1250,
  });

  const [trends] = useState<TrendData[]>([
    { label: "Views", value: 1250000, change: 12.5 },
    { label: "Likes", value: 89500, change: 8.3 },
    { label: "Comments", value: 12300, change: -2.1 },
    { label: "Shares", value: 8900, change: 15.7 },
    { label: "Followers", value: 4520, change: 5.2 },
  ]);

  const [topVideos] = useState<VideoStats[]>([
    { id: "1", thumbnail: "", title: "My best dance video", views: 125000, likes: 8900, comments: 450, shares: 320, watchTime: 65, date: "2024-01-15" },
    { id: "2", thumbnail: "", title: "Cooking challenge", views: 98000, likes: 7200, comments: 380, shares: 210, watchTime: 52, date: "2024-01-12" },
    { id: "3", thumbnail: "", title: "Travel vlog", views: 76000, likes: 5400, comments: 290, shares: 180, watchTime: 48, date: "2024-01-10" },
    { id: "4", thumbnail: "", title: "Comedy skit", views: 65000, likes: 4800, comments: 520, shares: 150, watchTime: 42, date: "2024-01-08" },
    { id: "5", thumbnail: "", title: "Fitness routine", views: 52000, likes: 3900, comments: 180, shares: 120, watchTime: 38, date: "2024-01-05" },
  ]);

  const [demographics] = useState({
    ageGroups: [
      { range: "13-17", percentage: 15 },
      { range: "18-24", percentage: 45 },
      { range: "25-34", percentage: 25 },
      { range: "35-44", percentage: 10 },
      { range: "45+", percentage: 5 },
    ],
    gender: [
      { type: "Female", percentage: 58 },
      { type: "Male", percentage: 38 },
      { type: "Other", percentage: 4 },
    ],
    locations: [
      { country: "United States", percentage: 35 },
      { country: "United Kingdom", percentage: 15 },
      { country: "Canada", percentage: 12 },
      { country: "Australia", percentage: 8 },
      { country: "Germany", percentage: 6 },
    ],
  });

  useEffect(() => {
    // In production, fetch real analytics data from Supabase
    setLoading(false);
  }, [user, timeRange]);

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Creator Analytics</h2>
          <p className="text-muted-foreground text-sm">Sign in to view your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === range
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(analytics.totalViews)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+12.5%</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(analytics.totalFollowers)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+5.2%</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Total Likes</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(analytics.totalLikes)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+8.3%</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${analytics.revenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+22.1%</span>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Engagement Overview</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
              <p className="text-lg font-bold text-foreground">{formatNumber(analytics.totalLikes)}</p>
              <p className="text-[10px] text-muted-foreground">Likes</p>
            </div>
            <div>
              <MessageCircle className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold text-foreground">{formatNumber(analytics.totalComments)}</p>
              <p className="text-[10px] text-muted-foreground">Comments</p>
            </div>
            <div>
              <Share2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold text-foreground">{formatNumber(analytics.totalShares)}</p>
              <p className="text-[10px] text-muted-foreground">Shares</p>
            </div>
            <div>
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold text-foreground">{analytics.engagementRate}%</p>
              <p className="text-[10px] text-muted-foreground">Eng. Rate</p>
            </div>
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Performing Videos</h3>
          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <div key={video.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                <div className="w-16 h-10 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(video.views)}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(video.likes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Audience Demographics</h3>
          
          {/* Age Groups */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Age Distribution</p>
            <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden">
              {demographics.ageGroups.map((group) => (
                <div
                  key={group.range}
                  className="h-full bg-primary/80"
                  style={{ width: `${group.percentage}%` }}
                  title={`${group.range}: ${group.percentage}%`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {demographics.ageGroups.map((group) => (
                <span key={group.range} className="text-[10px] text-muted-foreground">{group.range}</span>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Gender</p>
            <div className="flex gap-4">
              {demographics.gender.map((g) => (
                <div key={g.type} className="text-center">
                  <p className="text-sm font-medium text-foreground">{g.percentage}%</p>
                  <p className="text-[10px] text-muted-foreground">{g.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Top Locations</p>
            <div className="space-y-2">
              {demographics.locations.map((loc) => (
                <div key={loc.country} className="flex items-center gap-2">
                  <span className="text-xs text-foreground w-24 truncate">{loc.country}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${loc.percentage}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{loc.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Content Performance</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Video className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{analytics.totalVideos}</p>
              <p className="text-[10px] text-muted-foreground">Videos</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold text-foreground">{formatDuration(analytics.avgWatchTime)}</p>
              <p className="text-[10px] text-muted-foreground">Avg. Watch</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold text-foreground">12</p>
              <p className="text-[10px] text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
