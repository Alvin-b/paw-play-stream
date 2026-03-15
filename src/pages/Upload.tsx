import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Music, Hash, Upload as UploadIcon, Sparkles } from "lucide-react";

const FILTERS = [
  { name: "Normal", css: "" },
  { name: "Vintage", css: "sepia(0.6) contrast(1.1) brightness(0.9)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.1)" },
  { name: "Cool", css: "hue-rotate(30deg) saturate(1.2)" },
  { name: "Vivid", css: "saturate(1.8) contrast(1.2)" },
  { name: "Fade", css: "opacity(0.8) brightness(1.15) contrast(0.85)" },
  { name: "Drama", css: "contrast(1.5) brightness(0.85) saturate(1.3)" },
  { name: "Retro", css: "sepia(0.4) hue-rotate(-15deg) saturate(1.5)" },
  { name: "Glow", css: "brightness(1.2) contrast(1.1) saturate(1.3)" },
];

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

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Create a video</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to upload and share videos.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            Log in
          </button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Video must be under 20MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError("");
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

      const hashtagArr = hashtags
        .split(/[,#\s]+/)
        .filter(Boolean)
        .map((h) => h.toLowerCase());

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
      
      // Update hashtags table
      for (const tag of hashtagArr) {
        await supabase.from("hashtags").upsert(
          { name: tag, video_count: 1 },
          { onConflict: "name" }
        ).select();
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)}>
          <X className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-foreground font-semibold">Post</span>
        <button
          onClick={handleUpload}
          disabled={!videoFile || uploading}
          className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 56px)" }}>
        {/* Video selector */}
        {!videoPreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[9/16] max-h-[50vh] rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-3"
          >
            <UploadIcon className="w-12 h-12 text-muted-foreground" />
            <span className="text-foreground font-semibold text-sm">Select video</span>
            <span className="text-muted-foreground text-xs">MP4 or WebM, max 20MB</span>
          </button>
        ) : (
          <div className="relative w-full aspect-[9/16] max-h-[35vh] rounded-xl overflow-hidden bg-muted">
            <video
              src={videoPreview}
              className="w-full h-full object-cover"
              style={{ filter: FILTERS[selectedFilter].css }}
              controls
              muted
            />
            <button
              onClick={() => { setVideoFile(null); setVideoPreview(""); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

        {/* Filters */}
        {videoPreview && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground text-sm font-semibold">Filters</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {FILTERS.map((filter, i) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(i)}
                  className={`shrink-0 flex flex-col items-center gap-1`}
                >
                  <div
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedFilter === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <video
                      src={videoPreview}
                      className="w-full h-full object-cover"
                      style={{ filter: filter.css }}
                      muted
                    />
                  </div>
                  <span className={`text-[10px] ${selectedFilter === i ? "text-primary" : "text-muted-foreground"}`}>
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Description */}
        <textarea
          placeholder="Describe your video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none resize-none focus:ring-2 focus:ring-primary"
        />

        {/* Hashtags */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            placeholder="Add hashtags (comma separated)"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Music */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <Music className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            placeholder="Add music name"
            value={musicName}
            onChange={(e) => setMusicName(e.target.value)}
            className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-muted">
          <span className="text-foreground text-sm">Public video</span>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-border"}`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Upload;
