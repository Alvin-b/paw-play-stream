import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Radio, X, Send, Heart, Gift, Users } from "lucide-react";

const LiveStream = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const [cameraError, setCameraError] = useState(false);

  const startLive = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 1280 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLive(true);
      setCameraError(false);

      // Simulate viewers
      const interval = setInterval(() => {
        setViewerCount(v => Math.min(v + Math.floor(Math.random() * 3), 999));
      }, 3000);
      
      // Simulate chat
      const chatInterval = setInterval(() => {
        const messages = [
          "🔥🔥🔥", "Hello!", "First time here!", "Love this!", "Where are you from?",
          "❤️❤️", "So cool!", "Follow me back!", "Amazing!", "Keep going!",
        ];
        setChatMessages(prev => [...prev.slice(-20), {
          user: `user_${Math.floor(Math.random() * 999)}`,
          text: messages[Math.floor(Math.random() * messages.length)],
        }]);
      }, 2000);

      return () => { clearInterval(interval); clearInterval(chatInterval); };
    } catch {
      setCameraError(true);
      setIsLive(true); // Still show live UI with placeholder
    }
  };

  const stopLive = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsLive(false);
    navigate(-1);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { user: profile?.username || "you", text: chatInput }]);
    setChatInput("");
  };

  const spawnHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, id]);
    setTimeout(() => setHearts(prev => prev.filter(h => h !== id)), 2000);
  };

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [stream]);

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
            onClick={startLive}
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
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Video / Camera Feed */}
      <div className="absolute inset-0 bg-muted">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-live" />
              <p className="text-foreground font-semibold text-lg">You're LIVE!</p>
              {cameraError && (
                <p className="text-muted-foreground text-xs mt-2">Camera unavailable – audio only mode</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating hearts */}
      {hearts.map(id => (
        <div
          key={id}
          className="absolute right-8 bottom-32 animate-float-up pointer-events-none"
          style={{ animationDelay: `${Math.random() * 0.3}s` }}
        >
          <Heart className="w-8 h-8 text-primary fill-primary" />
        </div>
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold animate-pulse-live">LIVE</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/30 backdrop-blur-sm">
            <Users className="w-3 h-3 text-foreground" />
            <span className="text-foreground text-xs">{viewerCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">{title || "Untitled"}</span>
        </div>
        <button
          onClick={stopLive}
          className="w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Chat overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="px-4 pb-2 max-h-[40vh] overflow-y-auto">
          {chatMessages.slice(-15).map((msg, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <span className="text-xs font-bold text-secondary shrink-0">{msg.user}</span>
              <span className="text-xs text-foreground">{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-background/30 backdrop-blur-sm">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Say something..."
            className="flex-1 h-9 px-3 rounded-full bg-background/30 text-foreground text-sm placeholder:text-foreground/50 outline-none"
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
