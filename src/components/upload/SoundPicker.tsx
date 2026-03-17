import { useState, useRef } from "react";
import { Search, Play, Pause, Music, X, Sparkles, ChevronRight } from "lucide-react";
import { appSounds, SOUND_CATEGORIES, suggestSoundForContent, AppSound } from "@/data/sounds";

interface SoundPickerProps {
  onSelect: (sound: AppSound) => void;
  onClose: () => void;
  description?: string;
  hashtags?: string[];
}

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const SoundPicker = ({ onSelect, onClose, description = "", hashtags = [] }: SoundPickerProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const aiSuggested = suggestSoundForContent(description, hashtags);

  const filtered = appSounds.filter((s) => {
    const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === "all" || s.category === category || (category === "trending" && s.trendingScore >= 9);
    return matchesQuery && matchesCat;
  });

  const togglePlay = (sound: AppSound) => {
    if (playingId === sound.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(sound.previewUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(sound.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose}>
          <X className="w-6 h-6 text-foreground" />
        </button>
        <h2 className="font-bold text-base">Sounds</h2>
        <div className="w-6" />
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sounds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 px-4 py-1 overflow-x-auto scrollbar-hide">
        {SOUND_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              category === cat.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* AI Suggestions */}
      {!query && category === "all" && aiSuggested.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">AI Recommended for Your Content</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {aiSuggested.map((sound) => (
              <button
                key={sound.id}
                onClick={() => onSelect(sound)}
                className="shrink-0 w-28 p-2 rounded-xl bg-primary/10 border border-primary/20 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-1">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{sound.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{sound.artist}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sound List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.map((sound) => (
          <div
            key={sound.id}
            className="flex items-center gap-3 py-3 border-b border-border/50"
          >
            <button
              onClick={() => togglePlay(sound)}
              className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
            >
              {playingId === sound.id ? (
                <Pause className="w-5 h-5 text-primary" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{sound.name}</p>
              <p className="text-xs text-muted-foreground">{sound.artist} · {sound.duration}s · {formatCount(sound.videoCount)} videos</p>
            </div>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setPlayingId(null);
                onSelect(sound);
              }}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0"
            >
              Use
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No sounds found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundPicker;
