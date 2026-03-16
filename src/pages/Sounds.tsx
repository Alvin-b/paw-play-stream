import { useState } from 'react';
import { Search, Music, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/navigation/BottomNav';

interface Sound {
  music_name: string;
  video_count: number;
  preview_url: string;
}

const Sounds = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSounds = async (q: string) => {
    setLoading(true);
    const { data } = await supabase
      .rpc('get_popular_sounds', { query: q || null });
    setSounds(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-background pb-16">
      <div className="sticky top-0 z-30 bg-background px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sounds"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchSounds(e.target.value);
            }}
            className="w-full h-10 pl-10 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          sounds.map((sound) => (
            <button key={sound.music_name} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{sound.music_name}</p>
                <p className="text-xs text-muted-foreground">{sound.video_count} videos</p>
              </div>
              <Play className="w-4 h-4 text-foreground ml-auto" />
            </button>
          ))
        )}
      </div>
      <BottomNav activeTab="friends" />
    </div>
  );
};

export default Sounds;

