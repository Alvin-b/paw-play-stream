import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      video_id, 
      description, 
      hashtags, 
      initial_likes = 0, 
      initial_views = 0, 
      initial_shares = 0,
      initial_comments = 0,
      category 
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Predict viral potential based on content and early metrics
    const prompt = `You are a viral prediction AI for a TikTok-style video platform. Analyze this video's potential to go viral.

Video ID: ${video_id || "unknown"}
Description: "${description || ""}"
Hashtags: ${JSON.stringify(hashtags || [])}
Category: ${category || "unknown"}
Initial metrics:
- Views: ${initial_views}
- Likes: ${initial_likes}
- Comments: ${initial_comments}
- Shares: ${initial_shares}

Based on this data, predict:
1. "viral_score": number 0-100 - overall viral potential
2. "viral_probability": number 0-1 - likelihood of going viral
3. "predicted_engagement_rate": number 0-1 - expected engagement rate
4. "predicted_views_24h": number - expected views in 24 hours
5. "predicted_views_7d": number - expected views in 7 days
6. "trending_score": number 0-100 - how trending this content is
7. "recommendations": array of 3-5 suggestions to improve viral potential
8. "best_posting_times": array of suggested times (e.g., "6pm EST", "9pm EST")
9. "target_demographics": array of suggested demographics
10. "comparison": similar successful videos or creators

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
          { role: "system", content: "You are a viral prediction AI that analyzes video content potential. Return only valid JSON." },
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
    let prediction;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      prediction = JSON.parse(cleaned);
    } catch {
      // Fallback prediction
      prediction = {
        viral_score: 45,
        viral_probability: 0.35,
        predicted_engagement_rate: 0.08,
        predicted_views_24h: Math.round(initial_views * 1.5) || 1000,
        predicted_views_7d: Math.round(initial_views * 5) || 5000,
        trending_score: 40,
        recommendations: [
          "Add more trending hashtags",
          "Use a hook in the first 3 seconds",
          "Encourage engagement with a call-to-action"
        ],
        best_posting_times: ["6pm EST", "9pm EST", "12pm EST"],
        target_demographics: ["Gen Z", "Millennials"],
        comparison: "Similar to trending dance videos"
      };
    }

    return new Response(JSON.stringify({
      success: true,
      video_id,
      ...prediction,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Viral prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
