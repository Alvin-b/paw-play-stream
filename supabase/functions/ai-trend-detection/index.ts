import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, user_engagement_history = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Analyze and predict trending content
    const prompt = `You are a trend detection AI for a TikTok-style video platform. Identify emerging trends and predict what's about to go viral.

User engagement history: ${JSON.stringify(user_engagement_history || [])}
Category focus: ${category || "all"}

Analyze and return:
1. "trending_hashtags": array of 10 currently trending hashtags with "name", "growth_rate" (0-1), "volume"
2. "emerging_trends": array of 5 emerging trends with "name", "description", "potential"
3. "declining_trends": array of 5 trends losing popularity
4. "content_opportunities": array of 5 content gaps/opportunities with "topic", "demand", "competition"
5. "seasonal_predictions": array of upcoming seasonal content opportunities
6. "creator_recommendations": array of 3-4 suggestions for content creators based on trends
7. "best_niches": array of 5 niches with high potential and low competition

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a trend analysis AI that identifies viral trends and content opportunities. Return only valid JSON." },
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
    let trends;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      trends = JSON.parse(cleaned);
    } catch {
      // Fallback trends
      trends = {
        trending_hashtags: [
          { name: "fyp", growth_rate: 0.9, volume: 1000000 },
          { name: "viral", growth_rate: 0.85, volume: 800000 },
          { name: "trending", growth_rate: 0.8, volume: 700000 },
          { name: "dance", growth_rate: 0.75, volume: 600000 },
          { name: "comedy", growth_rate: 0.7, volume: 500000 }
        ],
        emerging_trends: [
          { name: "AI Art", description: "AI-generated artwork videos", potential: 0.85 },
          { name: "Life Hacks", description: "Quick tips and tricks", potential: 0.8 },
          { name: "Pet Content", description: "Cute animal videos", potential: 0.9 }
        ],
        declining_trends: [
          { name: "outdated_challenge", description: "Old challenges" },
          { name: "repost", description: "Reposted content" }
        ],
        content_opportunities: [
          { topic: "Productivity Tips", demand: 0.8, competition: 0.3 },
          { topic: "DIY Crafts", demand: 0.7, competition: 0.4 }
        ],
        seasonal_predictions: [
          { topic: "Spring Cleaning", timeframe: "March-April" },
          { topic: "Summer Vibes", timeframe: "June-August" }
        ],
        creator_recommendations: [
          "Focus on authentic content",
          "Use trending sounds quickly",
          "Engage with comments early"
        ],
        best_niches: [
          "Educational Tech",
          "Pet Comedy",
          "Food ASMR",
          "Fitness Quick Tips",
          "DIY Home Decor"
        ]
      };
    }

    return new Response(JSON.stringify({
      success: true,
      category,
      ...trends,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Trend detection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
