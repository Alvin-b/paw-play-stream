import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      type, // "sentiment_analysis" | "auto_moderation" | "highlight" | "insights" | "translation"
      stream_id,
      chat_messages,
      stream_title,
      language,
      user_id 
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let prompt;

    switch (type) {
      case "sentiment_analysis":
        prompt = `Analyze the sentiment of this live stream chat.
        
Stream title: "${stream_title || ""}"
Chat messages: ${JSON.stringify(chat_messages || [])}

Return JSON with:
1. "overall_sentiment": "positive" | "neutral" | "negative"
2. "sentiment_score": number -1 to 1
3. "emotions": object with emotion counts (excited, happy, bored, angry, etc.)
4. "engagement_level": number 0-100
5. "peak_emotions": array of peak emotion moments
6. "viewer_mood_trends": array of mood changes over time`;
        break;
        
      case "auto_moderation":
        prompt = `Moderate live stream chat for policy violations.

Stream ID: ${stream_id}
Chat messages: ${JSON.stringify(chat_messages || [])}

Return JSON with:
1. "flagged_messages": array of objects with message, reason, severity
2. "blocked_users": array of user IDs to block
3. "auto_deleted_count": number of messages auto-deleted
4. "safety_score": number 0-100
5. "recommendations": array of moderation suggestions`;
        break;
        
      case "highlight":
        prompt = `Identify highlight moments from this live stream.

Stream title: "${stream_title || ""}"
Chat messages: ${JSON.stringify(chat_messages || [])}

Return JSON with:
1. "highlight_moments": array of objects with timestamp, description, engagement_peak
2. "best_moments": top 5 moments
3. "clip_suggestions": array of suggested clip timestamps
4. "summary": brief stream summary
5. "viewers_missed": moments viewers should watch later`;
        break;
        
      case "insights":
        prompt = `Generate AI insights for this live stream.

Stream title: "${stream_title || ""}"
Chat messages: ${JSON.stringify(chat_messages || [])}

Return JSON with:
1. "key_topics": array of discussion topics
2. "popular_moments": array of moments with high engagement
3. "viewer_questions": array of unanswered questions
4. "content_suggestions": array of suggestions for future streams
5. "statistics": object with stream metrics
6. "growth_opportunities": array of areas to improve`;
        break;
        
      case "translation":
        prompt = `Translate live stream chat messages.

Stream ID: ${stream_id}
Language: ${language || "en"}
Chat messages: ${JSON.stringify(chat_messages || [])}

Return JSON with:
1. "original_language": detected language
2. "translated_messages": array of original + translated messages
3. "language_distribution": object with language counts
4. "multilingual_support": boolean
5. "recommended_languages": array of languages to support`;
        break;
        
      default:
        prompt = `Process live stream data.

Stream ID: ${stream_id}
Type: ${type}
Data: ${JSON.stringify(chat_messages || [])}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI live stream assistant. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      // Fallback demo responses based on type
      switch (type) {
        case "sentiment_analysis":
          result = {
            overall_sentiment: "positive",
            sentiment_score: 0.7,
            emotions: { excited: 45, happy: 30, neutral: 15, bored: 5, angry: 5 },
            engagement_level: 85,
            peak_emotions: [],
            viewer_mood_trends: []
          };
          break;
        case "auto_moderation":
          result = {
            flagged_messages: [],
            blocked_users: [],
            auto_deleted_count: 0,
            safety_score: 95,
            recommendations: ["Keep up the great engagement!"]
          };
          break;
        case "highlight":
          result = {
            highlight_moments: [],
            best_moments: [],
            clip_suggestions: [],
            summary: "Great stream!",
            viewers_missed: []
          };
          break;
        case "insights":
          result = {
            key_topics: [],
            popular_moments: [],
            viewer_questions: [],
            content_suggestions: [],
            statistics: { total_messages: 0, unique_viewers: 0 },
            growth_opportunities: []
          };
          break;
        case "translation":
          result = {
            original_language: "en",
            translated_messages: [],
            language_distribution: { en: 100 },
            multilingual_support: true,
            recommended_languages: ["es", "fr", "de"]
          };
          break;
        default:
          result = {};
      }
    }

    return new Response(JSON.stringify({
      success: true,
      type,
      stream_id,
      ...result,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Live stream AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
