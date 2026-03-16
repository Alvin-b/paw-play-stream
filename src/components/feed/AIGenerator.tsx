import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, Video, Music, Languages, Wand2, Loader2, 
  Play, Download, RefreshCw, Check, Copy, X, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIGeneratorProps {
  onClose: () => void;
}

interface VideoGenerationResult {
  video_id: string;
  enhanced_prompt: string;
  style: string;
  duration: number;
  resolution: string;
  fps: number;
  demo_video_url: string;
}

interface MusicResult {
  id: string;
  track_name: string;
  genre: string;
  mood: string;
  duration: number;
  bpm: number;
  instruments: string[];
  audio_url: string;
  waveform_data: number[];
}

interface TranslationResult {
  translation_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
}

export function AIGenerator({ onClose }: AIGeneratorProps) {
  const [activeTab, setActiveTab] = useState("video");
  
  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("cinematic");
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  
  // Music generation state
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicMood, setMusicMood] = useState("upbeat");
  const [musicDuration, setMusicDuration] = useState(30);
  const [musicGenerating, setMusicGenerating] = useState(false);
  const [musicResult, setMusicResult] = useState<MusicResult | null>(null);
  
  // Translation state
  const [translateText, setTranslateText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim()) return;
    setVideoGenerating(true);
    try {
      const { data } = await supabase.functions.invoke("ai-video-generation", {
        body: { prompt: videoPrompt, style: videoStyle, duration: videoDuration }
      });
      if (data?.success) {
        setVideoResult(data);
      }
    } catch (err) {
      console.error("Video generation error:", err);
    }
    setVideoGenerating(false);
  };

  const handleMusicGenerate = async () => {
    if (!musicPrompt.trim()) return;
    setMusicGenerating(true);
    try {
      const { data } = await supabase.functions.invoke("ai-voice-music", {
        body: { type: "music_generate", prompt: musicPrompt, mood: musicMood, duration: musicDuration }
      });
      if (data?.success) {
        setMusicResult(data);
      }
    } catch (err) {
      console.error("Music generation error:", err);
    }
    setMusicGenerating(false);
  };

  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    setTranslating(true);
    try {
      const { data } = await supabase.functions.invoke("ai-translation", {
        body: { type: "text", content: translateText, target_language: targetLanguage }
      });
      if (data?.success) {
        setTranslationResult(data);
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
    setTranslating(false);
  };

  const languages = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
  ];

  const styles = ["cinematic", "realistic", "animated", "abstract", "documentary", "music_video"];
  const moods = ["upbeat", "calm", "energetic", "melancholic", "happy", "dramatic", "romantic", "mysterious"];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">AI Generator</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Video
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="w-4 h-4" /> Music
            </TabsTrigger>
            <TabsTrigger value="translate" className="flex items-center gap-2">
              <Languages className="w-4 h-4" /> Translate
            </TabsTrigger>
          </TabsList>

          {/* Video Generation Tab */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Text-to-Video Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Describe your video</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="A cat playing in a park with autumn leaves..."
                    className="w-full mt-1 p-3 bg-muted rounded-lg text-sm"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Style</label>
                    <select
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value)}
                      className="w-full mt-1 p-2 bg-muted rounded-lg text-sm"
                    >
                      {styles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-muted rounded-lg text-sm"
                    >
                      <option value={3}>3 seconds</option>
                      <option value={5}>5 seconds</option>
                      <option value={10}>10 seconds</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleVideoGenerate} 
                  disabled={!videoPrompt.trim() || videoGenerating}
                  className="w-full"
                >
                  {videoGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  {videoGenerating ? "Generating..." : "Generate Video"}
                </Button>

                {videoResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Generated</Badge>
                      <span className="text-xs text-muted-foreground">{videoResult.duration}s • {videoResult.style}</span>
                    </div>
                    {videoResult.demo_video_url && (
                      <video 
                        src={videoResult.demo_video_url} 
                        controls 
                        className="w-full rounded-lg"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">{videoResult.enhanced_prompt}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Generation Tab */}
          <TabsContent value="music">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Music Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Describe the music</label>
                  <input
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="Upbeat electronic dance music..."
                    className="w-full mt-1 p-3 bg-muted rounded-lg text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Mood</label>
                    <select
                      value={musicMood}
                      onChange={(e) => setMusicMood(e.target.value)}
                      className="w-full mt-1 p-2 bg-muted rounded-lg text-sm"
                    >
                      {moods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <select
                      value={musicDuration}
                      onChange={(e) => setMusicDuration(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-muted rounded-lg text-sm"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleMusicGenerate} 
                  disabled={!musicPrompt.trim() || musicGenerating}
                  className="w-full"
                >
                  {musicGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Music className="w-4 h-4 mr-2" />}
                  {musicGenerating ? "Generating..." : "Generate Music"}
                </Button>

                {musicResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{musicResult.genre}</Badge>
                      <span className="text-xs text-muted-foreground">{musicResult.bpm} BPM</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      {musicResult.waveform_data?.slice(0, 50).map((v, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-primary rounded-full"
                          style={{ height: `${v}%` }}
                        />
                      ))}
                    </div>
                    {musicResult.audio_url && (
                      <audio src={musicResult.audio_url} controls className="w-full" />
                    )}
                    <p className="text-sm font-medium">{musicResult.track_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translation Tab */}
          <TabsContent value="translate">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Translator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Text to translate</label>
                  <textarea
                    value={translateText}
                    onChange={(e) => setTranslateText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="w-full mt-1 p-3 bg-muted rounded-lg text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Target language</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full mt-1 p-2 bg-muted rounded-lg text-sm"
                  >
                    {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>

                <Button 
                  onClick={handleTranslate} 
                  disabled={!translateText.trim() || translating}
                  className="w-full"
                >
                  {translating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
                  {translating ? "Translating..." : "Translate"}
                </Button>

                {translationResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{translationResult.source_language} → {translationResult.target_language}</Badge>
                      <span className="text-xs text-muted-foreground">{Math.round(translationResult.confidence * 100)}% confidence</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Original:</p>
                      <p className="text-sm">{translationResult.original_text}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Translated:</p>
                      <p className="text-sm font-medium">{translationResult.translated_text}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(translationResult.translated_text)}
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
