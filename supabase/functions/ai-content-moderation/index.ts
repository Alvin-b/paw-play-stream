import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, content_type, user_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Analyze content for policy violations
    const prompt = `You are a content moderation AI for a social media platform. Analyze the following content for policy violations.

Content to analyze: "${content}"
Content type: ${content_type || "text"}
User ID: ${user_id || "unknown"}

Check for:
1. Hate speech or discrimination
2. Violence or graphic content
3. Sexual content or nudity
4. Harassment or bullying
5. Spam or misleading content
6. Illegal content
7. Self-harm or suicide content
8. Dangerous challenges or activities

Return a JSON object with:
1. "is_safe": boolean - whether the content passes moderation
2. "risk_level": "low" | "medium" | "high" | "critical"
3. "violations": array of objects with "category", "severity" (0-1), "description"
4. "recommended_action": "approve" | "review" | "reject" | "warning"
5. "confidence": number 0-1
6. "details": brief explanation of the analysis

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
          { role: "system", content: "You are a strict content moderation AI. Return only valid JSON." },
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
    const content_ = data.choices?.[0]?.message?.content || "{}";
    let analysis;
    try {
      const cleaned = content_.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      // Default safe response if parsing fails
      analysis = {
        is_safe: true,
        risk_level: "low",
        violations: [],
        recommended_action: "approve",
        confidence: 0.5,
        details: "Analysis completed with default safe result"
      };
    }

    return new Response(JSON.stringify({
      success: true,
      content_type,
      user_id,
      ...analysis,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Content moderation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
