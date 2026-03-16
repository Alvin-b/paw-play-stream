import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, search_type = "semantic", filters = {} } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Enhance search with AI understanding
    const prompt = `You are an AI-powered semantic search assistant for a TikTok-style video platform. Convert natural language queries into optimized search parameters.

User query: "${query}"
Search type: ${search_type} (semantic, visual, hashtag, creator)
Filters: ${JSON.stringify(filters)}

Analyze the query and return:
1. "enhanced_query": string - refined search query
2. "intent": "discover" | "learn" | "entertainment" | "creator" | "specific_video"
3. "suggested_hashtags": array of relevant hashtags
4. "suggested_categories": array of content categories
5. "sort_by": "relevance" | "trending" | "recent" | "engagement"
6. "time_filter": "all" | "24h" | "week" | "month" | "year"
7. "related_queries": array of 3-5 related search suggestions
8. "search_expansion": array of keywords to add to search

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
          { role: "system", content: "You are a semantic search AI that understands user intent and optimizes search queries. Return only valid JSON." },
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
    let searchAnalysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      searchAnalysis = JSON.parse(cleaned);
    } catch {
      // Fallback search analysis
      searchAnalysis = {
        enhanced_query: query,
        intent: "discover",
        suggested_hashtags: [],
        suggested_categories: [],
        sort_by: "relevance",
        time_filter: "all",
        related_queries: [],
        search_expansion: []
      };
    }

    return new Response(JSON.stringify({
      success: true,
      original_query: query,
      ...searchAnalysis,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Search enhancement error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
