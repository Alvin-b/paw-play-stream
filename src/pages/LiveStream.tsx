import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Radio, X } from "lucide-react";

const LiveStream = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("");
  const [viewerCount] = useState(0);

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Go Live</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to start streaming.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            Log in
          </button>
        </div>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <span className="text-foreground font-semibold flex-1">Go Live</span>
        </div>

        <div className="p-4 space-y-4 mt-8">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <Radio className="w-16 h-16 text-primary" />
            </div>
          </div>

          <input
            placeholder="Add a title for your LIVE..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={() => setIsLive(true)}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            Go LIVE
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Live streaming uses your device camera. Make sure you have a stable internet connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background relative">
      {/* Simulated live view */}
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-live" />
          <p className="text-foreground font-semibold text-lg">You're LIVE!</p>
          <p className="text-muted-foreground text-sm mt-1">{title || "Untitled stream"}</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold animate-pulse-live">LIVE</span>
          <span className="text-foreground text-xs">{viewerCount} watching</span>
        </div>
        <button
          onClick={() => { setIsLive(false); navigate(-1); }}
          className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default LiveStream;
