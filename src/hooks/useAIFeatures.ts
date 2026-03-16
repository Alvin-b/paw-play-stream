import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Types for AI features
export interface AICaption {
  startTime: number;
  endTime: number;
  text: string;
}

export interface CaptionResult {
  success: boolean;
  video_id?: string;
  captions: AICaption[];
  language: string;
  confidence: number;
  duration: number;
}

export interface ModerationResult {
  success: boolean;
  is_safe: boolean;
  risk_level: "low" | "medium" | "high" | "critical";
  violations: Array<{ category: string; severity: number; description: string }>;
  recommended_action: "approve" | "review" | "reject" | "warning";
  confidence: number;
  details: string;
}

export interface SmartReplyResult {
  success: boolean;
  suggestions: string[];
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  best_reply: string;
}

export interface ViralPrediction {
  success: boolean;
  viral_score: number;
  viral_probability: number;
  predicted_engagement_rate: number;
  predicted_views_24h: number;
  predicted_views_7d: number;
  trending_score: number;
  recommendations: string[];
  best_posting_times: string[];
  target_demographics: string[];
}

export interface TrendData {
  success: boolean;
  trending_hashtags: Array<{ name: string; growth_rate: number; volume: number }>;
  emerging_trends: Array<{ name: string; description: string; potential: number }>;
  content_opportunities: Array<{ topic: string; demand: number; competition: number }>;
  creator_recommendations: string[];
  best_niches: string[];
}

export interface SearchEnhancement {
  success: boolean;
  original_query: string;
  enhanced_query: string;
  intent: string;
  suggested_hashtags: string[];
  suggested_categories: string[];
  sort_by: string;
  time_filter: string;
  related_queries: string[];
}

// Hook for AI Auto-captioning
export function useAICaption() {
  const [captions, setCaptions] = useState<CaptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaptions = useCallback(async (videoId: string, videoUrl?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-auto-caption", {
        body: { video_id: videoId, video_url: videoUrl }
      });
      
      if (fnError) throw fnError;
      setCaptions(data);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { captions, generateCaptions, loading, error };
}

// Hook for AI Content Moderation
export function useAIModeration() {
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateContent = useCallback(async (content: string, contentType: string = "text", userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-moderation", {
        body: { content, content_type: contentType, user_id: userId }
      });
      
      if (fnError) throw fnError;
      setResult(data);
      return data as ModerationResult;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, moderateContent, loading, error };
}

// Hook for AI Smart Reply
export function useAISmartReply() {
  const [suggestions, setSuggestions] = useState<SmartReplyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReplies = useCallback(async (
    comment: string, 
    videoDescription?: string, 
    commentCount?: number,
    replyCount?: number,
    username?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-smart-reply", {
        body: { 
          comment, 
          video_description: videoDescription,
          comment_count: commentCount,
          reply_count: replyCount,
          username
        }
      });
      
      if (fnError) throw fnError;
      setSuggestions(data);
      return data as SmartReplyResult;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, getReplies, loading, error };
}

// Hook for AI Viral Prediction
export function useAIViralPrediction() {
  const [prediction, setPrediction] = useState<ViralPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictViral = useCallback(async (
    videoId: string,
    description?: string,
    hashtags?: string[],
    initialMetrics?: { likes?: number; views?: number; shares?: number; comments?: number },
    category?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-viral-prediction", {
        body: { 
          video_id: videoId,
          description,
          hashtags,
          ...initialMetrics,
          category
        }
      });
      
      if (fnError) throw fnError;
      setPrediction(data);
      return data as ViralPrediction;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { prediction, predictViral, loading, error };
}

// Hook for AI Trend Detection
export function useAITrends() {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectTrends = useCallback(async (category?: string, userHistory?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-trend-detection", {
        body: { category, user_engagement_history: userHistory }
      });
      
      if (fnError) throw fnError;
      setTrends(data);
      return data as TrendData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { trends, detectTrends, loading, error };
}

// Hook for AI Search Enhancement
export function useAISearch() {
  const [searchAnalysis, setSearchAnalysis] = useState<SearchEnhancement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceSearch = useCallback(async (
    query: string,
    searchType: "semantic" | "visual" | "hashtag" | "creator" = "semantic",
    filters?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-search", {
        body: { query, search_type: searchType, filters }
      });
      
      if (fnError) throw fnError;
      setSearchAnalysis(data);
      return data as SearchEnhancement;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchAnalysis, enhanceSearch, loading, error };
}
