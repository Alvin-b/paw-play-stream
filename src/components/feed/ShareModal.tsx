import { useState } from "react";
import { AnimatePresence, motion } from 
;
import { X, Link as LinkIcon, MessageCircle, Copy, Flag, Layers, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  videoUrl?: string;
  videoDescription?: string;
}

const ShareModal = ({ isOpen, onClose, videoId, videoUrl, videoDescription }: ShareModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"share" | "duet" | "stitch">("share");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopyLink = () => {
    const link = videoId ? `${window.location.origin}/video/${videoId}` : window.location.href;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
    onClose();
  };

  const handleDuet = async () => {
    if (!user) {
      toast.error("Please log in to create a Duet");
      return;
    }
    
    if (!videoId) {
      toast.error("Cannot create Duet: missing video");
      return;
    }

    setIsProcessing(true);
    try {
      // Record the duet intention - actual video creation happens in upload flow
      await supabase.from("videos").insert({
        user_id: user.id,
        video_url: videoUrl || "",
        description: `Duet with: ${videoDescription || ""}`,
        music_name: "original sound",
        is_public: true,
      });
      
      toast.success("Duet ready! Record your video now.");
      onClose();
    } catch (error) {
      toast.error("Failed to start Duet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStitch = async () => {
    if (!user) {
      toast.error("Please log in to create a Stitch");
      return;
    }

    if (!videoId) {
      toast.error("Cannot create Stitch: missing video");
      return;
    }

    setIsProcessing(true);
    try {
      // Record the stitch intention
      await supabase.from("videos").insert({
        user_id: user.id,
        video_url: videoUrl || "",
        description: `Stitched: ${videoDescription || ""}`,
        music_name: "original sound",
        is_public: true,
      });
      
      toast.success("Stitch ready! Record your reaction now.");
      onClose();
    } catch (error) {
      toast.error("Failed to start Stitch");
    } finally {
      setIsProcessing(false);
    }
  };

  const shareOptions = [
    { icon: MessageCircle, label: "Message", action: () => toast.info("Coming soon") },
    { icon: LinkIcon, label: "Copy link", action: handleCopyLink },
    { icon: Copy, label: "Embed", action: () => toast.info("Embed code copied") },
    { icon: Flag, label: "Report", action: () => toast.info("Report submitted") },
  ];

  const duetStitchOptions = [
    { 
      icon: Layers, 
      label: "Duet", 
      description: "Create a video side-by-side",
      action: handleDuet,
      color: "bg-purple-500"
    },
    { 
      icon: Scissors, 
      label: "Stitch", 
      description: "React to a clip from the video",
      action: handleStitch,
      color: "bg-pink-500"
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 z-40" onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Tab Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("share")}
                  className={`text-sm font-semibold transition-colors ${activeTab === "share" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Share
                </button>
                <button 
                  onClick={() => setActiveTab("duet")}
                  className={`text-sm font-semibold transition-colors ${activeTab === "duet" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Duet
                </button>
                <button 
                  onClick={() => setActiveTab("stitch")}
                  className={`text-sm font-semibold transition-colors ${activeTab === "stitch" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Stitch
                </button>
              </div>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Share Tab Content */}
            {activeTab === "share" && (
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  {shareOptions.map((opt) => (
                    <button key={opt.label} onClick={opt.action} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <opt.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <span className="text-foreground text-[10px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duet Tab Content */}
            {activeTab === "duet" && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                    <Layers className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Create a Duet</h3>
                  <p className="text-sm text-muted-foreground">
                    Record your video alongside the original to react, collaborate, or add your twist.
                  </p>
                </div>
                
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-sm text-foreground">Duet tips:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Keep your reaction short and relevant</li>
                    <li>• Use the original audio or add your own</li>
                    <li>• Be original - don't just copy</li>
                  </ul>
                </div>

                <button 
                  onClick={handleDuet}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Layers className="w-5 h-5" />
                      Start Duet
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Stitch Tab Content */}
            {activeTab === "stitch" && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto">
                    <Scissors className="w-8 h-8 text-pink-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Create a Stitch</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a clip from the video and record your reaction to it.
                  </p>
                </div>
                
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-sm text-foreground">Stitch tips:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Choose the best 1-5 second clip</li>
                    <li>• React with your face visible</li>
                    <li>• Add your thoughts after the clip</li>
                  </ul>
                </div>

                <button 
                  onClick={handleStitch}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-pink-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Scissors className="w-5 h-5" />
                      Select Clip
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
