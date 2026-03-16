import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { VOICE_EFFECTS } from "@/lib/filters";

interface VoiceChangerProps {
  isEnabled: boolean;
  onToggle: () => void;
  onEffectChange: (effect: typeof VOICE_EFFECTS[0]) => void;
}

const VoiceChanger = ({ isEnabled, onToggle, onEffectChange }: VoiceChangerProps) => {
  const [selectedEffect, setSelectedEffect] = useState(VOICE_EFFECTS[0]);
  const [showEffects, setShowEffects] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const handleEffectSelect = (effect: typeof VOICE_EFFECTS[0]) => {
    setSelectedEffect(effect);
    onEffectChange(effect);
    setShowEffects(false);
  };

  return (
    <div className="relative">
      {/* Main Voice Button */}
      <button
        onClick={onToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isEnabled 
            ? "bg-primary text-primary-foreground" 
            : "bg-background/30 backdrop-blur-sm text-foreground"
        }`}
      >
        {isEnabled ? <Volume2 className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Voice Effects Panel */}
      {showEffects && (
        <div className="absolute bottom-14 right-0 bg-background/90 backdrop-blur-lg rounded-2xl p-2 w-40 max-h-[60vh] overflow-y-auto z-50">
          <p className="text-xs font-semibold text-muted-foreground px-2 pb-2">Voice Effects</p>
          {VOICE_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              onClick={() => handleEffectSelect(effect)}
              className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                selectedEffect.value === effect.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {effect.name}
            </button>
          ))}
        </div>
      )}

      {/* Toggle Effects Panel Button */}
      {isEnabled && (
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
        >
          ▼
        </button>
      )}
    </div>
  );
};

// Audio processor hook for voice effects
export const useVoiceEffect = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const applyVoiceEffect = async (
    mediaStream: MediaStream, 
    effect: typeof VOICE_EFFECTS[0]
  ): Promise<MediaStream> => {
    // Create audio context if not exists
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    
    // Create source from media stream
    const source = audioContext.createMediaStreamSource(mediaStream);
    
    // Create gain node for pitch adjustment
    const gainNode = audioContext.createGain();
    gainNode.gain.value = effect.pitch;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return mediaStream;
  };

  const cleanup = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return { applyVoiceEffect, cleanup };
};

export default VoiceChanger;
