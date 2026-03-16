import { useState, useEffect, useRef } from "react";
import { useAICaption, AICaption } from "@/hooks/useAIFeatures";
import { Subtitles, Settings, X, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface AICaptionsProps {
  videoId: string;
  videoUrl?: string;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
}

export function AICaptions({
  videoId,
  videoUrl,
  isPlaying,
  currentTime,
  onTimeUpdate
}: AICaptionsProps) {
  const { captions, generateCaptions, loading, error } = useAICaption();
  const [enabled, setEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const [showSettings, setShowSettings] = useState(false);
  
  const [currentCaption, setCurrentCaption] = useState<AICaption | null>(null);

  // Find current caption based on video time
  useEffect(() => {
    if (!captions?.captions || !enabled) {
      setCurrentCaption(null);
      return;
    }

    const caption = captions.captions.find(
      (c: AICaption) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    setCurrentCaption(caption || null);
  }, [currentTime, captions, enabled]);

  const handleGenerate = async () => {
    await generateCaptions(videoId, videoUrl);
  };

  const handleDownloadSRT = () => {
    if (!captions?.captions) return;

    let srtContent = "";
    captions.captions.forEach((caption: AICaption, index: number) => {
      const startTime = formatSRTTime(caption.startTime);
      const endTime = formatSRTTime(caption.endTime);
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captions-${videoId}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  return (
    <div className="relative">
      {/* Generate Captions Button */}
      {!captions && !loading && (
        <Button
          onClick={handleGenerate}
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 z-10"
        >
          <Subtitles className="w-4 h-4 mr-2" />
          Generate Captions
        </Button>
      )}

      {loading && (
        <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-xs">Generating...</span>
        </div>
      )}

      {error && (
        <div className="absolute top-2 right-2 z-10 bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Caption Display */}
      {captions && enabled && currentCaption && (
        <div
          className={`absolute ${position === "bottom" ? "bottom-16" : "top-4"} left-0 right-0 text-center pointer-events-none px-4`}
        >
          <span
            className="inline-block bg-black/70 text-white px-3 py-1.5 rounded-lg"
            style={{ fontSize: `${fontSize}px` }}
          >
            {currentCaption.text}
          </span>
        </div>
      )}

      {/* Caption Controls */}
      {captions && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? "bg-primary text-primary-foreground" : ""}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadSRT}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && captions && (
        <div className="absolute top-12 right-2 z-20 bg-card border rounded-lg shadow-lg p-3 w-48">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Captions</span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Font Size: {fontSize}px</span>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={12}
                max={32}
                step={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Position</span>
              <div className="flex gap-1">
                <Button
                  variant={position === "top" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPosition("top")}
                  className="text-xs px-2"
                >
                  Top
                </Button>
                <Button
                  variant={position === "bottom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPosition("bottom")}
                  className="text-xs px-2"
                >
                  Bottom
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="w-full"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confidence indicator */}
      {captions && (
        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Subtitles className="w-3 h-3" />
          <span>{Math.round(captions.confidence * 100)}% accurate</span>
        </div>
      )}
    </div>
  );
}
