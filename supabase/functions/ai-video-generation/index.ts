import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, style, duration = 5, user_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate video using AI
    const systemPrompt = `You are an AI video generation engine. Generate a detailed prompt for video creation based on user input.

User's video prompt: "${prompt}"
Desired style: ${style || "realistic"}
Duration: ${duration} seconds

Return a JSON object with:
1. "enhanced_prompt": detailed prompt for video generation
2. "style": recommended style
3. "duration": duration in seconds
4. "resolution": recommended resolution (e.g., "1080x1920" for vertical)
5. "fps": frames per second
6. "mood": suggested mood/atmosphere
7. "technical_notes": any technical specifications
8. "estimated_generation_time": in seconds
9. "generation_status": "queued" | "processing" | "completed"

In production, this would integrate with APIs like:
- RunwayML
- Pika Labs
- Stable Video Diffusion
- OpenAI Sora

For now, return a demo response that simulates video generation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a video from: ${prompt}` },
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
    let videoConfig;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      videoConfig = JSON.parse(cleaned);
    } catch {
      // Fallback demo response
      videoConfig = {
        enhanced_prompt: prompt,
        style: style || "cinematic",
        duration,
        resolution: "1080x1920",
        fps: 30,
        mood: "energetic",
        technical_notes: "High quality, smooth motion",
        estimated_generation_time: 60,
        generation_status: "completed",
        demo_video_url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
      };
    }

    // Add demo video URL for testing
    videoConfig.generation_status = "completed";
    videoConfig.demo_video_url = "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";
    videoConfig.video_id = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    videoConfig.created_at = new Date().toISOString();

    return new Response(JSON.stringify({
      success: true,
      user_id,
      ...videoConfig
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Video generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
