export interface VideoData {
  id: string;
  userId?: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
    isFollowing: boolean;
  };
  description: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  videoUrl: string;
  audioUrl?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  hasViewed?: boolean;
}

// Using free stock video URLs
export const mockVideos: VideoData[] = [
  {
    id: "1",
    userId: "user-1",
    user: {
      username: "traveler_mike",
      displayName: "Mike Adventures",
      avatar: "https://i.pravatar.cc/150?img=1",
      isFollowing: false,
    },
    description: "Sunset vibes at the beach 🌅 #travel #sunset #beach #vibes",
    music: "Blinding Lights - The Weeknd",
    likes: 142300,
    comments: 3421,
    shares: 1230,
    bookmarks: 8920,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    userId: "user-2",
    user: {
      username: "chef_anna",
      displayName: "Anna Cooks",
      avatar: "https://i.pravatar.cc/150?img=5",
      isFollowing: true,
    },
    description: "Easy pasta recipe anyone can make 🍝 #cooking #recipe #pasta #foodtok",
    music: "original sound - chef_anna",
    likes: 89200,
    comments: 1205,
    shares: 4320,
    bookmarks: 23100,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "3",
    userId: "user-3",
    user: {
      username: "danceking99",
      displayName: "Dance King",
      avatar: "https://i.pravatar.cc/150?img=8",
      isFollowing: false,
    },
    description: "New dance challenge 🔥 Try it! #dance #challenge #trending #fyp",
    music: "Levitating - Dua Lipa",
    likes: 534000,
    comments: 12400,
    shares: 45200,
    bookmarks: 31000,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    userId: "user-4",
    user: {
      username: "naturelover",
      displayName: "Nature Daily",
      avatar: "https://i.pravatar.cc/150?img=12",
      isFollowing: false,
    },
    description: "Did you know octopuses have 3 hearts? 🐙 #nature #facts #ocean #animals",
    music: "Calm Ocean Waves",
    likes: 267000,
    comments: 5670,
    shares: 12300,
    bookmarks: 45600,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "5",
    userId: "user-5",
    user: {
      username: "fitnessjay",
      displayName: "Jay Fitness",
      avatar: "https://i.pravatar.cc/150?img=15",
      isFollowing: true,
    },
    description: "5 min morning workout 💪 No equipment needed! #fitness #workout #gym #health",
    music: "Eye of the Tiger - Survivor",
    likes: 198000,
    comments: 3210,
    shares: 8900,
    bookmarks: 67800,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    isLiked: false,
    isBookmarked: false,
  },
];
