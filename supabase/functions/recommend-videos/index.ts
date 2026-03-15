import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, watched_hashtags, liked_hashtags, limit = 20 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a video recommendation engine for a TikTok-like app. Given the user's watch and like history, generate a ranking strategy.

User's most watched hashtags: ${JSON.stringify(watched_hashtags || [])}
User's most liked hashtags: ${JSON.stringify(liked_hashtags || [])}

Based on this data, return a JSON object with:
1. "recommended_hashtags": array of 10 hashtags the user would likely enjoy (without #)
2. "content_mix": object with percentages for "similar" (content like what they watch), "explore" (new content), "trending" (popular content)
3. "reasoning": brief explanation

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
          { role: "system", content: "You are a recommendation engine. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Try to parse the AI response
    let recommendations;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = {
        recommended_hashtags: ["fyp", "viral", "trending", "funny", "dance", "cooking", "travel", "music", "comedy", "pets"],
        content_mix: { similar: 40, explore: 30, trending: 30 },
        reasoning: "Default recommendations based on popular content",
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Recommendation error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error",
      recommended_hashtags: ["fyp", "viral", "trending", "funny", "dance"],
      content_mix: { similar: 40, explore: 30, trending: 30 },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
