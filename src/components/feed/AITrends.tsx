import { useEffect } from "react";
import { useAITrends } from "@/hooks/useAIFeatures";
import { TrendingUp, Hash, Lightbulb, Sparkles, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AITrendsProps {
  category?: string;
  userHistory?: string[];
}

export function AITrends({ category, userHistory }: AITrendsProps) {
  const { trends, detectTrends, loading, error } = useAITrends();

  useEffect(() => {
    detectTrends(category, userHistory);
  }, [category, userHistory]);

  const getGrowthColor = (rate: number) => {
    if (rate >= 0.7) return "text-green-500";
    if (rate >= 0.4) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getGrowthIcon = (rate: number) => {
    if (rate >= 0.7) return <ArrowUp className="w-3 h-3" />;
    if (rate >= 0.4) return <Minus className="w-3 h-3" />;
    return <ArrowDown className="w-3 h-3" />;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">AI-Trending Now</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => detectTrends(category, userHistory)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

      {loading && !trends && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {trends && (
        <div className="grid gap-4">
          {/* Trending Hashtags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Trending Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trends.trending_hashtags.slice(0, 5).map((tag, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{tag.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatVolume(tag.volume)} posts
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${getGrowthColor(tag.growth_rate)}`}>
                      {getGrowthIcon(tag.growth_rate)}
                      <span className="text-xs">{Math.round(tag.growth_rate * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emerging Trends */}
          {trends.emerging_trends.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Emerging Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trends.emerging_trends.map((trend, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {trend.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Opportunities */}
          {trends.content_opportunities.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Content Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.content_opportunities.map((opp, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{opp.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Demand: {Math.round(opp.demand * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Competition: {Math.round(opp.competition * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Best Niches */}
          {trends.best_niches.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Best Niches to Explore</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trends.best_niches.map((niche, i) => (
                    <Badge key={i} variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {niche}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creator Recommendations */}
          {trends.creator_recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {trends.creator_recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
