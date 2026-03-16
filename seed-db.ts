import { supabase } from './src/integrations/supabase/client';
import type { Database } from './src/integrations/supabase/types';

// Sample data - videos use public sample URLs from mockVideos
const sampleProfiles: Database['public']['Tables']['profiles']['Insert'][] = [
  { user_id: 'demo-user1', username: 'traveler_mike', display_name: 'Mike Adventures', bio: 'Travel junkie 🌍', followers_count: 12500, following_count: 340, likes_count: 45000 },
  { user_id: 'demo-user2', username: 'chef_anna', display_name: 'Anna Cooks', bio: 'Easy recipes for busy people 🍳', followers_count: 8900, following_count: 120, likes_count: 32000 },
  { user_id: 'demo-user3', username: 'danceking99', display_name: 'Dance King', bio: 'Dance challenges & tutorials 💃', followers_count: 234000, following_count: 89, likes_count: 1200000 },
  { user_id: 'demo-user4', username: 'naturelover', display_name: 'Nature Daily', bio: 'Ocean facts & wildlife 🐙', followers_count: 67000, following_count: 250, likes_count: 890000 },
  { user_id: 'demo-user5', username: 'fitnessjay', display_name: 'Jay Fitness', bio: 'Quick home workouts 💪', followers_count: 45000, following_count: 156, likes_count: 560000 },
];

const sampleVideos: Database['public']['Tables']['videos']['Insert'][] = [
  {
    user_id: 'demo-user1',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Sunset vibes at the beach 🌅',
    music_name: 'Blinding Lights - The Weeknd',
    hashtags: ['travel', 'sunset', 'beach'],
    likes_count: 142300, comments_count: 3421, shares_count: 1230, bookmarks_count: 8920, views_count: 2500000, is_public: true,
  },
  {
    user_id: 'demo-user2',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'Easy pasta recipe anyone can make 🍝',
    music_name: 'original sound',
    hashtags: ['cooking', 'recipe', 'pasta'],
    likes_count: 89200, comments_count: 1205, shares_count: 4320, bookmarks_count: 23100, views_count: 1800000, is_public: true,
  },
  {
    user_id: 'demo-user3',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description: 'New dance challenge 🔥 Try it!',
    music_name: 'Levitating - Dua Lipa',
    hashtags: ['dance', 'challenge'],
    likes_count: 534000, comments_count: 12400, shares_count: 45200, bookmarks_count: 31000, views_count: 8500000, is_public: true,
  },
  // Add 2 more...
  {
    user_id: 'demo-user4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    description: 'Did you know octopuses have 3 hearts? 🐙',
    music_name: 'Calm Ocean Waves',
    hashtags: ['nature', 'facts'],
    likes_count: 267000, comments_count: 5670, shares_count: 12300, bookmarks_count: 45600, views_count: 4200000, is_public: true,
  },
  {
    user_id: 'demo-user5',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    description: '5 min morning workout 💪 No equipment!',
    music_name: 'Eye of the Tiger',
    hashtags: ['fitness', 'workout'],
    likes_count: 198000, comments_count: 3210, shares_count: 8900, bookmarks_count: 67800, views_count: 3100000, is_public: true,
  },
];

const sampleHashtags: Database['public']['Tables']['hashtags']['Insert'][] = [
  { name: 'travel', video_count: 1, views_count: 2500000 },
  { name: 'sunset', video_count: 1, views_count: 2500000 },
  { name: 'cooking', video_count: 1, views_count: 1800000 },
  // etc.
];

export async function seed() {
  console.log('Seeding profiles...');
  const { error: profileError } = await supabase.from('profiles').insert(sampleProfiles);
  if (profileError) console.error('Profiles error:', profileError);

  console.log('Seeding videos...');
  const { error: videoError } = await supabase.from('videos').insert(sampleVideos);
  if (videoError) console.error('Videos error:', videoError);

  console.log('Seeding hashtags...');
  const { error: hashtagError } = await supabase.from('hashtags').insert(sampleHashtags);
  if (hashtagError) console.error('Hashtags error:', hashtagError);

  console.log('Seed complete! Run `npm run dev` to test. Note: User_ids are demo-*, create matching Supabase users or adjust.');
}

// Run if direct (Node/Deno)
if (typeof require !== 'undefined' || typeof import.meta !== 'undefined' && import.meta.main) {
  seed();
}

console.log('Seed script ready. Needs VITE_SUPABASE_URL/KEY in .env. Adjust user_ids to match your Supabase auth users.');
