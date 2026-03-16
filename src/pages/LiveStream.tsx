import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Radio, X, Send, Heart, Gift, Users, Sparkles, RotateCcw } from "lucide-react";
import { LIVE_FILTERS } from "@/lib/filters";

const LiveStream = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string; isGift?: boolean }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const [cameraError, setCameraError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [duration, setDuration] = useState(0);

  const startLive = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 720, height: 1280 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsLive(true);
      setCameraError(false);

      const viewerInterval = setInterval(() => {
        setViewerCount((v) => Math.min(v + Math.floor(Math.random() * 5), 9999));
      }, 2500);

      const chatInterval = setInterval(() => {
        const msgs = [
          "🔥🔥🔥", "Hello!", "First time here!", "Love this!", "Where are you from?",
          "❤️❤️", "So cool!", "Follow me back!", "Amazing!", "Keep going!",
          "You're awesome!", "Hi from Brazil 🇧🇷", "Greetings from Kenya 🇰🇪", "🎉🎉",
          "Can you say hi to me?", "What camera do you use?", "This is fire 🔥",
        ];
        const isGift = Math.random() > 0.85;
        setChatMessages((prev) => [
          ...prev.slice(-25),
          {
            user: `user_${Math.floor(Math.random() * 999)}`,
            text: isGift ? "sent a gift 🎁" : msgs[Math.floor(Math.random() * msgs.length)],
            isGift,
          },
        ]);
      }, 1500);

      return () => {
        clearInterval(viewerInterval);
        clearInterval(chatInterval);
      };
    } catch {
      setCameraError(true);
      setIsLive(true);
    }
  };

  // Duration timer
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  const stopLive = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsLive(false);
    setDuration(0);
    navigate(-1);
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    stream?.getTracks().forEach((t) => t.stop());
    setFacingMode(newMode);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode, width: 720, height: 1280 },
        audio: true,
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch {}
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { user: profile?.username || "you", text: chatInput }]);
    setChatInput("");
  };

  const spawnHeart = () => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, id]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h !== id)), 2000);
  };

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Go Live</h2>
          <p className="text-muted-foreground text-sm mb-6">Log in to start streaming.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">Log in</button>
        </div>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <span className="text-foreground font-bold flex-1">Go Live</span>
        </div>
        <div className="p-6 space-y-6 mt-4">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio className="w-14 h-14 text-primary" />
            </div>
          </div>
          <input
            placeholder="Add a title for your LIVE..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={startLive}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-transform active:scale-[0.98]"
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
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Camera Feed */}
      <div className="absolute inset-0 bg-card">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
              filter: LIVE_FILTERS[selectedFilter]?.css || "",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-live" />
              <p className="text-foreground font-bold text-lg">You're LIVE!</p>
              {cameraError && <p className="text-muted-foreground text-xs mt-2">Camera unavailable</p>}
            </div>
          </div>
        )}
      </div>

      {/* Floating hearts */}
      {hearts.map((id) => (
        <div
          key={id}
          className="absolute right-8 bottom-32 animate-float-up pointer-events-none"
          style={{ animationDelay: `${Math.random() * 0.3}s`, left: `${75 + Math.random() * 15}%` }}
        >
          <Heart className="w-7 h-7 text-primary fill-primary" />
        </div>
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-black tracking-wide animate-pulse-live">
            LIVE
          </span>
          <span className="px-2 py-0.5 rounded-full bg-background/30 backdrop-blur-sm text-foreground text-[10px] font-bold">
            {formatDuration(duration)}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/30 backdrop-blur-sm">
            <Users className="w-3 h-3 text-foreground" />
            <span className="text-foreground text-[10px] font-bold">{viewerCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={switchCamera} className="w-8 h-8 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className="w-8 h-8 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={stopLive} className="w-8 h-8 rounded-full bg-destructive/80 backdrop-blur-sm flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Live Filters Picker */}
      {showFilters && (
        <div className="absolute top-14 right-3 z-30 bg-background/70 backdrop-blur-lg rounded-2xl p-2 max-h-[50vh] overflow-y-auto w-20">
          {LIVE_FILTERS.map((filter, i) => (
            <button
              key={filter.name}
              onClick={() => setSelectedFilter(i)}
              className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium text-center mb-1 transition-colors ${
                selectedFilter === i ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      )}

      {/* Chat overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="px-4 pb-2 max-h-[35vh] overflow-y-auto">
          {chatMessages.slice(-20).map((msg, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <span className={`text-[11px] font-bold shrink-0 ${msg.isGift ? "text-secondary" : "text-primary"}`}>
                {msg.user}
              </span>
              <span className={`text-[11px] ${msg.isGift ? "text-secondary font-semibold" : "text-foreground"}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-background/20 backdrop-blur-md">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Say something..."
            className="flex-1 h-9 px-3 rounded-full bg-background/20 text-foreground text-xs placeholder:text-foreground/40 outline-none"
          />
          <button onClick={sendChat} className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
          <button onClick={spawnHeart} className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center">
            <Gift className="w-4 h-4 text-secondary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
