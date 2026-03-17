import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, SwitchCamera, X, Circle, Square, Sparkles, Timer, Zap } from "lucide-react";
import { VIDEO_FILTERS, FILTER_CATEGORIES, VideoFilter } from "@/lib/filters";

interface CameraRecorderProps {
  onRecordComplete: (blob: Blob) => void;
  onClose: () => void;
}

const CameraRecorder = ({ onRecordComplete, onClose }: CameraRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>("none");
  const [flashOn, setFlashOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCamera]);

  const flipCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onRecordComplete(blob);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const filteredFilters = filterCategory === "none"
    ? VIDEO_FILTERS.filter((_, i) => i < 20)
    : VIDEO_FILTERS.filter(f => f.category === filterCategory || f.name === "Normal");

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera Preview */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            filter: VIDEO_FILTERS[selectedFilter]?.css || "",
            transform: facingMode === "user" ? "scaleX(-1)" : "",
          }}
        />

        {/* Countdown Overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white text-8xl font-bold animate-pulse">{countdown}</span>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          {recording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/80 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold">{formatTime(elapsed)}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <SwitchCamera className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setFlashOn(!flashOn)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Zap className={`w-5 h-5 ${flashOn ? "text-yellow-400" : "text-white"}`} />
            </button>
            <button onClick={startWithCountdown} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="absolute bottom-28 left-0 right-0">
          <div className="flex gap-1.5 px-3 py-1 overflow-x-auto scrollbar-hide">
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                  filterCategory === cat.id
                    ? "bg-white text-black"
                    : "bg-white/20 text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Filter Previews */}
          <div className="flex gap-2 px-3 pt-2 overflow-x-auto scrollbar-hide">
            {filteredFilters.map((filter) => {
              const idx = VIDEO_FILTERS.indexOf(filter);
              return (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(idx)}
                  className="shrink-0 flex flex-col items-center gap-0.5"
                >
                  <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${selectedFilter === idx ? "border-white" : "border-transparent"}`}>
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" style={{ filter: filter.css }} />
                  </div>
                  <span className={`text-[9px] ${selectedFilter === idx ? "text-white font-bold" : "text-white/60"}`}>
                    {filter.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Record Button */}
      <div className="bg-black py-6 flex items-center justify-center gap-6">
        <button
          onClick={recording ? stopRecording : startRecording}
          className="relative w-20 h-20 flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white" />
          {recording ? (
            <div className="w-8 h-8 rounded-md bg-destructive" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-destructive" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CameraRecorder;
