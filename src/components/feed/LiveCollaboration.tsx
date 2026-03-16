import { useState, useRef, useEffect } from "react";
import { Users, Video, Mic, MicOff, Camera, CameraOff, X, Hand, MessageSquare, UserPlus, Check, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LiveCollaborationProps {
  isOpen: boolean;
  onClose: () => void;
  hostId?: string;
}

interface Guest {
  id: string;
  name: string;
  avatar: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  hasRaisedHand: boolean;
}

const LiveCollaboration = ({ isOpen, onClose, hostId }: LiveCollaborationProps) => {
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    { id: "1", name: "User123", avatar: "", isVideoOn: true, isAudioOn: true, hasRaisedHand: false },
    { id: "2", name: "DanceQueen", avatar: "", isVideoOn: true, isAudioOn: false, hasRaisedHand: true },
    { id: "3", name: "SingerPro", avatar: "", isVideoOn: false, isAudioOn: true, hasRaisedHand: false },
  ]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const handleRequestToJoin = () => {
    if (!user) {
      toast.error("Please log in to request to join");
      return;
    }
    setShowRequestForm(true);
  };

  const handleSendRequest = () => {
    toast.success("Request sent to host!");
    setShowRequestForm(false);
    setRequestMessage("");
  };

  const handleInvite = (guestId: string) => {
    toast.success("Invitation sent!");
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-foreground font-semibold">Live Collaboration</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="p-4">
        {/* Current Guests Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Currently in Live ({guests.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {guests.map((guest) => (
              <div key={guest.id} className="relative bg-muted rounded-xl p-3">
                {/* Video Preview */}
                <div className="aspect-video bg-black rounded-lg mb-2 relative overflow-hidden">
                  {guest.isVideoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/50">
                        {guest.name[0].toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <CameraOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status Icons */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {guest.isAudioOn ? (
                      <Mic className="w-4 h-4 text-white" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {guest.hasRaisedHand && (
                    <div className="absolute top-2 right-2">
                      <Hand className="w-5 h-5 text-yellow-500 animate-bounce" />
                    </div>
                  )}
                </div>

                {/* Guest Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">Guest</p>
                  </div>
                  <button
                    onClick={() => handleRemoveGuest(guest.id)}
                    className="p-1.5 rounded-full bg-destructive/20 hover:bg-destructive/30"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request to Join */}
        {!showRequestForm ? (
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Join the Live</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Want to join this live stream as a guest? Request permission from the host.
            </p>
            <button
              onClick={handleRequestToJoin}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Request to Join
            </button>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Send Request</h3>
            <textarea
              placeholder="Add a message to your request..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full h-24 p-3 rounded-xl bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRequestForm(false)}
                className="flex-1 py-2 rounded-lg bg-muted text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Send Request
              </button>
            </div>
          </div>
        )}

        {/* Pending Requests (for host) */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {[
              { name: "NewUser1", message: "I'd love to join and dance!" },
              { name: "MusicLover", message: "Can I perform a song?" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{req.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.name}</p>
                    <p className="text-xs text-muted-foreground">{req.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInvite(req.name)}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </button>
                  <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl">
          <h4 className="text-sm font-semibold text-foreground mb-2">💡 Tips for Live Collaboration</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Up to 5 guests can join a live stream</li>
            <li>• Guests appear in a grid layout</li>
            <li>• Raise your hand to request to speak</li>
            <li>• Host can mute or remove guests anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LiveCollaboration;
