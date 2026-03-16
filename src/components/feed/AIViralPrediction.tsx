import { useAIViralPrediction } from "@/hooks/useAIFeatures";
import { TrendingUp, Eye, Heart, Share, MessageCircle, Clock, Target, Lightbulb, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface AIViralPredictionProps {
  videoId: string;
  description?: string;
  hashtags?: string[];
  initialMetrics?: { likes?: number; views?: number; shares?: number; comments?: number };
  category?: string;
  onClose: () => void;
}

export function AIViralPrediction({
  videoId,
  description,
  hashtags,
  initialMetrics,
  category,
  onClose
}: AIViralPredictionProps) {
  const { prediction, predictViral, loading, error } = useAIViralPrediction();

  const handleAnalyze = async () => {
    await predictViral(videoId, description, hashtags, initialMetrics, category);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-card border rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Viral Potential Analysis</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!prediction && !loading && (
        <Button 
          onClick={handleAnalyze} 
          className="w-full"
          size="sm"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analyze Viral Potential
        </Button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Analyzing...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm py-2">{error}</div>
      )}

      {prediction && (
        <div className="space-y-4">
          {/* Main Score */}
          <div className="text-center">
            <div className="relative inline-flex">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * prediction.viral_score) / 100}
                  className={`${getScoreBg(prediction.viral_score)} transition-all duration-1000`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(prediction.viral_score)}`}>
                  {Math.round(prediction.viral_score)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Viral Score</p>
          </div>

          {/* Predictions */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">24h Views</p>
              <p className="font-semibold text-sm">
                {prediction.predicted_views_24h >= 1000 
                  ? `${(prediction.predicted_views_24h / 1000).toFixed(1)}K` 
                  : prediction.predicted_views_24h}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">7d Views</p>
              <p className="font-semibold text-sm">
                {prediction.predicted_views_7d >= 1000 
                  ? `${(prediction.predicted_views_7d / 1000).toFixed(1)}K` 
                  : prediction.predicted_views_7d}
              </p>
            </div>
          </div>

          {/* Engagement Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Engagement Rate</span>
              <span>{(prediction.predicted_engagement_rate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={prediction.predicted_engagement_rate * 100} className="h-2" />
          </div>

          {/* Best Posting Times */}
          {prediction.best_posting_times.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                <span>Best Posting Times</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {prediction.best_posting_times.map((time, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Demographics */}
          {prediction.target_demographics.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Target className="w-3 h-3" />
                <span>Target Audience</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {prediction.target_demographics.map((demo, i) => (
                  <span key={i} className="px-2 py-1 bg-muted text-xs rounded-full">
                    {demo}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Lightbulb className="w-3 h-3" />
                <span>Recommendations</span>
              </div>
              <ul className="space-y-1">
                {prediction.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
