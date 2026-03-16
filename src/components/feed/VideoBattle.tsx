import { useState } from "react";
import { Trophy, Users, Vote, Swords, X, Play, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface VideoBattleProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  videoUrl?: string;
}

interface Battle {
  id: string;
  video1_url: string;
  video2_url: string;
  video1_user: string;
  video2_user: string;
  video1_votes: number;
  video2_votes: number;
  status: "active" | "completed";
  created_at: string;
}

const VideoBattle = ({ isOpen, onClose, videoId, videoUrl }: VideoBattleProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "battles">("create");
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [userVote, setUserVote] = useState<1 | 2 | null>(null);

  const handleCreateBattle = async () => {
    if (!user) {
      toast.error("Please log in to create a battle");
      return;
    }

    // In a real app, this would create a battle in the database
    // For now, we'll show a success message
    toast.success("Battle created! Waiting for opponent...");
    onClose();
  };

  const handleVote = (vote: 1 | 2) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }
    
    setUserVote(vote);
    toast.success(`Voted for Video ${vote}!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("create")}
            className={`text-sm font-semibold ${activeTab === "create" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Create Battle
          </button>
          <button 
            onClick={() => setActiveTab("battles")}
            className={`text-sm font-semibold ${activeTab === "battles" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Active Battles
          </button>
        </div>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      {activeTab === "create" ? (
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Swords className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Video Battle</h2>
            <p className="text-muted-foreground text-sm">
              Challenge another creator to a video battle! Your videos will be shown side by side and viewers will vote for the best one.
            </p>
          </div>

          {/* Battle Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-muted rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>1. Select your best video</li>
                <li>2. Wait for a challenger or challenge a friend</li>
                <li>3. Viewers vote for the winner</li>
                <li>4. Winner gets featured on the battle leaderboard</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleCreateBattle}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Start a Battle
          </button>
        </div>
      ) : (
        <div className="p-4">
          {/* Sample Active Battles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Trending Battles</h3>
            
            {/* Sample Battle Card */}
            <div className="bg-muted rounded-xl overflow-hidden">
              <div className="relative aspect-video flex">
                {/* Video 1 */}
                <div className="flex-1 relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    @dancer123
                  </div>
                </div>
                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">VS</span>
                </div>
                {/* Video 2 */}
                <div className="flex-1 relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    @singer456
                  </div>
                </div>
              </div>
              
              {/* Vote Buttons */}
              <div className="flex border-t border-border">
                <button 
                  onClick={() => handleVote(1)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${userVote === 1 ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">1,234</span>
                </button>
                <div className="w-px bg-border" />
                <button 
                  onClick={() => handleVote(2)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${userVote === 2 ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">987</span>
                </button>
              </div>
            </div>

            {/* Another Battle Card */}
            <div className="bg-muted rounded-xl overflow-hidden">
              <div className="relative aspect-video flex">
                <div className="flex-1 relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    @comedian99
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">VS</span>
                </div>
                <div className="flex-1 relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    @magicmike
                  </div>
                </div>
              </div>
              <div className="flex border-t border-border">
                <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">2,567</span>
                </button>
                <div className="w-px bg-border" />
                <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">1,892</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBattle;
