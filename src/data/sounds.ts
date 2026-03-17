export interface AppSound {
  id: string;
  name: string;
  artist: string;
  duration: number;
  previewUrl: string;
  category: string;
  trendingScore: number;
  videoCount: number;
}

export const SOUND_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "trending", label: "🔥 Trending" },
  { id: "pop", label: "Pop" },
  { id: "hiphop", label: "Hip Hop" },
  { id: "edm", label: "EDM" },
  { id: "rnb", label: "R&B" },
  { id: "rock", label: "Rock" },
  { id: "latin", label: "Latin" },
  { id: "lofi", label: "Lo-Fi" },
  { id: "comedy", label: "Comedy" },
  { id: "original", label: "Original" },
];

// Free-to-use sample audio URLs from public domain / CC0 sources
export const appSounds: AppSound[] = [
  { id: "s1", name: "Neon Nights", artist: "SynthWave", duration: 30, previewUrl: "https://cdn.pixabay.com/audio/2022/10/11/audio_3720ca6a76.mp3", category: "edm", trendingScore: 9.8, videoCount: 245000 },
  { id: "s2", name: "Summer Vibes", artist: "DJ Sunshine", duration: 25, previewUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", category: "pop", trendingScore: 9.5, videoCount: 198000 },
  { id: "s3", name: "Trap Beat Fire", artist: "808Mafia", duration: 28, previewUrl: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", category: "hiphop", trendingScore: 9.3, videoCount: 187000 },
  { id: "s4", name: "Chill Lo-Fi Study", artist: "LoFi Girl", duration: 35, previewUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", category: "lofi", trendingScore: 9.1, videoCount: 156000 },
  { id: "s5", name: "Reggaeton Flow", artist: "Latino Beat", duration: 22, previewUrl: "https://cdn.pixabay.com/audio/2022/08/25/audio_4f3b0a8c83.mp3", category: "latin", trendingScore: 8.9, videoCount: 134000 },
  { id: "s6", name: "Electric Dreams", artist: "FutureBass", duration: 30, previewUrl: "https://cdn.pixabay.com/audio/2022/10/11/audio_3720ca6a76.mp3", category: "edm", trendingScore: 8.7, videoCount: 123000 },
  { id: "s7", name: "Smooth R&B", artist: "VelvetVox", duration: 32, previewUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", category: "rnb", trendingScore: 8.5, videoCount: 112000 },
  { id: "s8", name: "Rock Anthem", artist: "ThunderStrike", duration: 27, previewUrl: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", category: "rock", trendingScore: 8.3, videoCount: 98000 },
  { id: "s9", name: "Pop Princess", artist: "StarGlow", duration: 24, previewUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", category: "pop", trendingScore: 8.1, videoCount: 89000 },
  { id: "s10", name: "Comedy Sound FX", artist: "FunnyBones", duration: 8, previewUrl: "https://cdn.pixabay.com/audio/2022/08/25/audio_4f3b0a8c83.mp3", category: "comedy", trendingScore: 8.0, videoCount: 87000 },
  { id: "s11", name: "Midnight Drive", artist: "NeonPulse", duration: 30, previewUrl: "https://cdn.pixabay.com/audio/2022/10/11/audio_3720ca6a76.mp3", category: "edm", trendingScore: 7.9, videoCount: 78000 },
  { id: "s12", name: "Afrobeat Groove", artist: "AfroKing", duration: 26, previewUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", category: "hiphop", trendingScore: 7.8, videoCount: 72000 },
  { id: "s13", name: "Classical Remix", artist: "OrchMix", duration: 35, previewUrl: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", category: "original", trendingScore: 7.6, videoCount: 65000 },
  { id: "s14", name: "Kawaii Pop", artist: "TokyoBeat", duration: 20, previewUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", category: "pop", trendingScore: 7.5, videoCount: 61000 },
  { id: "s15", name: "Bass Drop Heavy", artist: "WubWub", duration: 18, previewUrl: "https://cdn.pixabay.com/audio/2022/08/25/audio_4f3b0a8c83.mp3", category: "edm", trendingScore: 7.3, videoCount: 56000 },
  { id: "s16", name: "Acoustic Sunrise", artist: "GuitarSoul", duration: 32, previewUrl: "https://cdn.pixabay.com/audio/2022/10/11/audio_3720ca6a76.mp3", category: "original", trendingScore: 7.1, videoCount: 49000 },
  { id: "s17", name: "Drill Beat UK", artist: "LDN Drill", duration: 25, previewUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", category: "hiphop", trendingScore: 7.0, videoCount: 45000 },
  { id: "s18", name: "Jazz Cafe", artist: "SmoothJazz", duration: 40, previewUrl: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", category: "lofi", trendingScore: 6.8, videoCount: 38000 },
  { id: "s19", name: "Dancehall Fire", artist: "IslandVibes", duration: 22, previewUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", category: "latin", trendingScore: 6.7, videoCount: 34000 },
  { id: "s20", name: "Epic Cinematic", artist: "FilmScore", duration: 45, previewUrl: "https://cdn.pixabay.com/audio/2022/08/25/audio_4f3b0a8c83.mp3", category: "original", trendingScore: 6.5, videoCount: 31000 },
  { id: "s21", name: "Sad Piano", artist: "MelodyTears", duration: 35, previewUrl: "https://cdn.pixabay.com/audio/2022/10/11/audio_3720ca6a76.mp3", category: "original", trendingScore: 6.3, videoCount: 28000 },
  { id: "s22", name: "Viral Dance Move", artist: "TikBeat", duration: 15, previewUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", category: "trending", trendingScore: 9.9, videoCount: 310000 },
  { id: "s23", name: "Oh No Oh No", artist: "MemeSound", duration: 6, previewUrl: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3", category: "comedy", trendingScore: 9.7, videoCount: 290000 },
  { id: "s24", name: "Sped Up Remix", artist: "SpeedMaster", duration: 20, previewUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", category: "trending", trendingScore: 9.6, videoCount: 270000 },
  { id: "s25", name: "Underwater Beats", artist: "DeepSea", duration: 30, previewUrl: "https://cdn.pixabay.com/audio/2022/08/25/audio_4f3b0a8c83.mp3", category: "lofi", trendingScore: 6.1, videoCount: 22000 },
];

export const suggestSoundForContent = (description: string, hashtags: string[]): AppSound[] => {
  const lowerDesc = description.toLowerCase();
  const allTags = hashtags.map(h => h.toLowerCase());
  
  const scored = appSounds.map(sound => {
    let score = sound.trendingScore;
    if (lowerDesc.includes('dance') || allTags.some(h => ['dance', 'challenge'].includes(h))) {
      if (['edm', 'trending', 'pop', 'latin'].includes(sound.category)) score += 3;
    }
    if (lowerDesc.includes('workout') || allTags.some(h => ['fitness', 'gym'].includes(h))) {
      if (['edm', 'rock', 'hiphop'].includes(sound.category)) score += 3;
    }
    if (lowerDesc.includes('chill') || allTags.some(h => ['relax', 'study'].includes(h))) {
      if (['lofi', 'rnb'].includes(sound.category)) score += 3;
    }
    if (lowerDesc.includes('funny') || allTags.some(h => ['comedy', 'meme'].includes(h))) {
      if (sound.category === 'comedy') score += 3;
    }
    return { sound, score };
  });
  
  return scored.sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.sound);
};
