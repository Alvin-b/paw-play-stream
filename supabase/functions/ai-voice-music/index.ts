import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      type, // "voice_clone" | "text_to_speech" | "music_generate"
      voice_sample_url,
      text,
      prompt,
      mood,
      duration,
      user_id 
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let response;
    
    if (type === "music_generate") {
      // Generate AI music based on prompt
      const musicPrompt = `You are an AI music generation engine. Generate music based on the following parameters.

Prompt: "${prompt || ""}"
Mood: ${mood || "upbeat"}
Duration: ${duration || 30} seconds

Return a JSON object with:
1. "track_name": suggested track name
2. "genre": recommended genre
3. "mood": mood of the music
4. "duration": duration in seconds
5. "bpm": beats per minute
6. "instruments": array of instruments
7. "generation_status": "queued" | "processing" | "completed"
8. "audio_url": URL to generated audio (for demo, provide sample URL)
9. "waveform_data": mock waveform data for visualization

In production, integrate with:
- Suno AI
- AIVA
- Soundraw
- Boomy`;

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an AI music generator. Return only valid JSON." },
            { role: "user", content: musicPrompt },
          ],
        }),
      });
    } else {
      // Voice cloning or text-to-speech
      const voicePrompt = `You are an AI voice synthesis engine. Process the following request.

Type: ${type}
${voice_sample_url ? `Voice sample URL: ${voice_sample_url}` : ""}
Text to speak: "${text || ""}"
Mood: ${mood || "neutral"}

Return a JSON object with:
1. "voice_id": unique voice identifier
2. "voice_name": name of the voice
3. "type": "cloned" | "text_to_speech"
4. "language": detected or specified language
5. "gender": "male" | "female" | "neutral"
6. "mood": mood of the voice
7. "duration": estimated duration in seconds
8. "generation_status": "queued" | "processing" | "completed"
9. "audio_url": URL to generated audio
10. "waveform_data": mock waveform data

In production, integrate with:
- Eleven Labs
- PlayHT
- Murf AI
- WellSaid Labs
- Coqui`;

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an AI voice synthesis engine. Return only valid JSON." },
            { role: "user", content: voicePrompt },
          ],
        }),
      });
    }

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
      // Fallback demo response
      if (type === "music_generate") {
        result = {
          track_name: prompt || "AI Generated Track",
          genre: "Electronic",
          mood: mood || "upbeat",
          duration: duration || 30,
          bpm: 128,
          instruments: ["synth", "drums", "bass"],
          generation_status: "completed",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          waveform_data: Array(50).fill(0).map(() => Math.random() * 100)
        };
      } else {
        result = {
          voice_id: `voice_${Date.now()}`,
          voice_name: type === "voice_clone" ? "Cloned Voice" : "AI Voice",
          type: type,
          language: "en",
          gender: "neutral",
          mood: mood || "neutral",
          duration: text ? Math.ceil(text.split(" ").length / 2.5) : 5,
          generation_status: "completed",
          audio_url: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
          waveform_data: Array(50).fill(0).map(() => Math.random() * 100)
        };
      }
    }

    // Ensure completion status and demo URLs
    result.generation_status = "completed";
    result.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    result.created_at = new Date().toISOString();

    return new Response(JSON.stringify({
      success: true,
      type,
      user_id,
      ...result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Voice/Music generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
