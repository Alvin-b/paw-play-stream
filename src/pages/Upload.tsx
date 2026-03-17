import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Music, Hash, Upload as UploadIcon, Sparkles, Camera, TrendingUp, Wand2, Globe, Lock, Plus } from "lucide-react";
import { VIDEO_FILTERS, FILTER_CATEGORIES } from "@/lib/filters";
import { AIViralPrediction } from "@/components/feed/AIViralPrediction";
import { AIGenerator } from "@/components/feed/AIGenerator";
import { Button } from "@/components/ui/button";
import SoundPicker from "@/components/upload/SoundPicker";
import CameraRecorder from "@/components/upload/CameraRecorder";
import { AppSound } from "@/data/sounds";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [description, setDescription] = useState("");
  const [musicName, setMusicName] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("none");
  const [mode, setMode] = useState<"upload" | "record">("upload");
  const [showAIPanel, setShowAIPanel] = useState<"viral" | "hashtags" | null>(null);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AppSound | null>(null);

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Create a video</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to upload and share videos.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            Log in
          </button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setError("Please select a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { setError("Video must be under 50MB"); return; }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRecordComplete = (blob: Blob) => {
    const file = new File([blob], `recording_${Date.now()}.webm`, { type: "video/webm" });
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(blob));
    setShowCamera(false);
    setMode("upload");
  };

  const handleSoundSelect = (sound: AppSound) => {
    setSelectedSound(sound);
    setMusicName(sound.name + " - " + sound.artist);
    setShowSoundPicker(false);
  };

  const handleUpload = async () => {
    if (!videoFile || !user) return;
    setUploading(true);
    setError("");
    setUploadProgress(10);
    try {
      const ext = videoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage.from("videos").upload(path, videoFile);
      if (uploadError) throw uploadError;
      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);

      const hashtagArr = hashtags.split(/[,#\s]+/).filter(Boolean).map((h) => h.toLowerCase());
      setUploadProgress(85);
      const { error: insertError } = await supabase.from("videos").insert({
        user_id: user.id,
        video_url: publicUrl,
        description,
        music_name: musicName || "original sound",
        hashtags: hashtagArr,
        is_public: isPublic,
      });
      if (insertError) throw insertError;
      setUploadProgress(100);
      for (const tag of hashtagArr) {
        await supabase.from("hashtags").upsert({ name: tag, video_count: 1 }, { onConflict: "name" }).select();
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
  };

  const filteredFilters = activeCategory === "none"
    ? VIDEO_FILTERS
    : VIDEO_FILTERS.filter((f) => f.category === activeCategory || f.name === "Normal");

  return (
    <div className="min-h-dvh bg-background">
      {/* Camera Recorder */}
      {showCamera && (
        <CameraRecorder
          onRecordComplete={handleRecordComplete}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Sound Picker */}
      {showSoundPicker && (
        <SoundPicker
          onSelect={handleSoundSelect}
          onClose={() => setShowSoundPicker(false)}
          description={description}
          hashtags={hashtags.split(/[,#\s]+/).filter(Boolean)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)}>
          <X className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          <button
            onClick={() => setMode("upload")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === "upload" ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            <UploadIcon className="w-3 h-3 inline mr-1" />Upload
          </button>
          <button
            onClick={() => { setMode("record"); setShowCamera(true); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === "record" ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            <Camera className="w-3 h-3 inline mr-1" />Record
          </button>
        </div>
        <button
          onClick={handleUpload}
          disabled={!videoFile || uploading}
          className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 56px)" }}>
        {/* Video selector */}
        {!videoPreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[9/16] max-h-[50vh] rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-foreground font-bold text-sm block">Select video</span>
              <span className="text-muted-foreground text-xs">MP4 or WebM, max 50MB</span>
            </div>
          </button>
        ) : (
          <div className="relative w-full aspect-[9/16] max-h-[35vh] rounded-2xl overflow-hidden bg-card">
            <video
              src={videoPreview}
              className="w-full h-full object-cover"
              style={{ filter: VIDEO_FILTERS[selectedFilter].css }}
              controls
              muted
            />
            <button
              onClick={() => { setVideoFile(null); setVideoPreview(""); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-background/50 backdrop-blur-sm">
              <span className="text-foreground text-[10px] font-semibold">
                {VIDEO_FILTERS[selectedFilter].name}
              </span>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

        {/* Filters */}
        {videoPreview && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground text-sm font-bold">Filters</span>
              <span className="text-muted-foreground text-xs">({VIDEO_FILTERS.length} filters)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filteredFilters.map((filter) => {
                const globalIndex = VIDEO_FILTERS.indexOf(filter);
                return (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(globalIndex)}
                    className="shrink-0 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedFilter === globalIndex ? "border-primary scale-105" : "border-transparent"
                      }`}
                    >
                      <video
                        src={videoPreview}
                        className="w-full h-full object-cover"
                        style={{ filter: filter.css }}
                        muted
                      />
                    </div>
                    <span className={`text-[9px] font-medium ${selectedFilter === globalIndex ? "text-primary" : "text-muted-foreground"}`}>
                      {filter.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-primary font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Description */}
        <textarea
          placeholder="Describe your video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none resize-none focus:ring-2 focus:ring-primary"
        />

        {/* Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted flex-1">
              <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Add hashtags (comma separated)"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => setShowAIPanel(showAIPanel === "hashtags" ? null : "hashtags")}
              className={`ml-2 p-2.5 rounded-xl ${showAIPanel === "hashtags" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              <Wand2 className="w-5 h-5" />
            </button>
          </div>
          {showAIPanel === "hashtags" && (
            <div className="bg-card border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">AI Hashtag Suggestions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your video content, here are trending hashtags that could boost your visibility:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.length > 0 ? (
                  suggestedHashtags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const currentTags = hashtags ? hashtags.split(",").map(t => t.trim()).filter(Boolean) : [];
                        if (!currentTags.includes(tag)) {
                          setHashtags(currentTags.length > 0 ? `${hashtags}, ${tag}` : tag);
                        }
                      }}
                      className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Add a description to get AI suggestions</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  try {
                    const { data } = await supabase.functions.invoke("ai-content-categorize", {
                      body: { description, hashtags: hashtags.split(/[,#\s]+/).filter(Boolean) }
                    });
                    if (data?.suggested_hashtags) {
                      setSuggestedHashtags(data.suggested_hashtags);
                    }
                  } catch (err) {
                    console.error("Failed to get suggestions:", err);
                  }
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Suggestions
              </Button>
            </div>
          )}
        </div>

        {/* Sound Selection */}
        <button
          onClick={() => setShowSoundPicker(true)}
          className="w-full p-3 rounded-xl bg-muted flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-foreground">
              {selectedSound ? selectedSound.name : "Add Sound"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedSound ? `${selectedSound.artist} · ${selectedSound.duration}s` : "Browse from 25+ sounds"}
            </p>
          </div>
          <span className="text-muted-foreground text-xs">›</span>
        </button>

        {/* AI Viral Prediction Toggle */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-muted">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-foreground text-sm font-medium">AI Viral Prediction</span>
          </div>
          <button
            onClick={() => setShowAIPanel(showAIPanel === "viral" ? null : "viral")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showAIPanel === "viral"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {showAIPanel === "viral" ? "Hide" : "Analyze"}
          </button>
        </div>

        {/* AI Generator Button */}
        <Button
          variant="outline"
          className="w-full py-6 border-dashed border-2"
          onClick={() => setShowAIGenerator(true)}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          <Plus className="w-4 h-4 mr-2" />
          AI Generate (Video, Music, Translate)
        </Button>

        {/* AI Viral Prediction Panel */}
        {showAIPanel === "viral" && (
          <AIViralPrediction
            videoId={Date.now().toString()}
            description={description}
            hashtags={hashtags.split(/[,#\s]+/).filter(Boolean)}
            onClose={() => setShowAIPanel(null)}
          />
        )}

        {/* Visibility toggle */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-muted">
          <div className="flex items-center gap-2">
            {isPublic ? <Globe className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
            <span className="text-foreground text-sm font-medium">{isPublic ? "Public" : "Private"}</span>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-border"}`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && <AIGenerator onClose={() => setShowAIGenerator(false)} />}
    </div>
  );
};

export default Upload;
