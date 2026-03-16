import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { comment, video_description, comment_count, reply_count, username } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate smart reply suggestions based on the comment context
    const prompt = `You are an AI assistant for a TikTok-style video platform. Generate smart reply suggestions for creators to respond to comments.

Comment: "${comment}"
Video description: "${video_description || "N/A"}"
Comment count: ${comment_count || 0}
Reply count: ${reply_count || 0}
Commenter username: ${username || "user"}

Generate 5-7 reply suggestions that:
1. Are contextually appropriate
2. Match the tone of the original comment
3. Encourage further engagement
4. Could work for a content creator

Include a mix of:
- Short acknowledgments
- Questions to continue the conversation
- Friendly/empathetic responses
- Humor (when appropriate)

Return a JSON object with:
1. "suggestions": array of 5-7 reply strings
2. "sentiment": "positive" | "neutral" | "negative" - the sentiment of the original comment
3. "category": the type of comment (e.g., "compliment", "question", "criticism", "spam", "joke")
4. "best_reply": the single best reply suggestion

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
          { role: "system", content: "You are a helpful AI that generates engaging reply suggestions for social media creators. Return only valid JSON." },
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
    let suggestions;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      // Fallback suggestions
      suggestions = {
        suggestions: [
          "Thanks for watching! 💕",
          "I'm glad you liked it!",
          "Thanks for the support!",
          "Appreciate you!",
          "Love your support! 🥰"
        ],
        sentiment: "positive",
        category: "compliment",
        best_reply: "Thanks for watching! 💕"
      };
    }

    return new Response(JSON.stringify({
      success: true,
      comment,
      username,
      ...suggestions,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Smart reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
