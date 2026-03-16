export interface AppSound {
  id: string;
  name: string;
  artist: string;
  duration: number;
  previewUrl: string;
  category: string;
  trendingScore: number;
  videoCount: number;
  waveformUrl: string;
}

export const appSounds: AppSound[] = [
  {
    id: "1",
    name: "Blinding Lights",
    artist: "The Weeknd",
    duration: 200,
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
    category: "pop",
    trendingScore: 9.8,
    videoCount: 124000,
    waveformUrl: "/waveforms/blinding-lights.png",
  },
  {
    id: "2",
    name: "Levitating",
    artist: "Dua Lipa",
    duration: 185,
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    category: "dance",
    trendingScore: 9.2,
    videoCount: 89000,
    waveformUrl: "/waveforms/levitating.png",
  },
  {
    id: "3",
    name: "Eye of the Tiger",
    artist: "Survivor",
    duration: 220,
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    category: "fitness",
    trendingScore: 8.7,
    videoCount: 67000,
    waveformUrl: "/waveforms/eye-tiger.png",
  },
  // 20+ more...
];

export const suggestSoundForContent = (description: string, hashtags: string[]): string => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('dance') || hashtags.some(h => ['dance', 'challenge'].includes(h))) return "2"; // Levitating
  if (lowerDesc.includes('workout') || hashtags.some(h => ['fitness', 'gym'].includes(h))) return "3"; // Eye of the Tiger
  return "1"; // Default Blinding Lights
};
