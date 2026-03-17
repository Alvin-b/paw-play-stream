import { useState, useEffect, useRef } from 'react';
import { Search, Music, Play, Pause, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appSounds, SOUND_CATEGORIES, AppSound } from '@/data/sounds';
import BottomNav from '@/components/navigation/BottomNav';

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const Sounds = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = appSounds.filter((s) => {
    const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'all' || s.category === category || (category === 'trending' && s.trendingScore >= 9);
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

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-bold text-lg text-foreground">Sounds</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sounds"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 rounded-full bg-muted text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {SOUND_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                category === cat.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-1">
        {filtered.map((sound) => (
          <div key={sound.id} className="flex items-center gap-3 py-3 border-b border-border/50">
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
              <p className="font-semibold text-sm text-foreground truncate">{sound.name}</p>
              <p className="text-xs text-muted-foreground">{sound.artist} · {sound.duration}s · {formatCount(sound.videoCount)} videos</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-primary font-bold">🔥 {sound.trendingScore}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No sounds found</p>
          </div>
        )}
      </div>
      <BottomNav activeTab="discover" />
    </div>
  );
};

export default Sounds;
