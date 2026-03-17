import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { VideoWithProfile } from "../../hooks/useVideos";

// Mock Supabase client
vi.mock("../../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

describe("VideoWithProfile interface", () => {
  it("should have all required properties", () => {
    const video: VideoWithProfile = {
      id: "video-1",
      video_url: "https://example.com/video.mp4",
      audio_url: null,
      description: "Test video",
      music_name: "Test sound",
      hashtags: ["test"],
      likes_count: 100,
      comments_count: 10,
      shares_count: 5,
      bookmarks_count: 2,
      views_count: 1000,
      user_id: "user-1",
      created_at: new Date().toISOString(),
      is_public: true,
      user: {
        username: "testuser",
        display_name: "Test User",
        avatar_url: null,
        verified: false,
      },
      isLiked: false,
      isBookmarked: false,
    };

    expect(video.likes_count).toBe(100);
    expect(video.user.username).toBe("testuser");
    expect(video.isLiked).toBe(false);
  });
});
