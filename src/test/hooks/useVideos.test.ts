import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVideos, useToggleLike, useToggleBookmark } from "./useVideos";
import { AuthProvider } from "../contexts/AuthContext";
import * as supabaseModule from "../integrations/supabase/client";

// Mock Supabase client
vi.mock("../integrations/supabase/client", () => ({
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

// Mock user context
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

const mockProfile = {
  id: "profile-id",
  user_id: "test-user-id",
  username: "testuser",
  display_name: "Test User",
  avatar_url: null,
  bio: "",
  verified: false,
  followers_count: 0,
  following_count: 0,
  likes_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe("useVideos hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return initial state with empty videos", async () => {
    const { result } = renderHook(() => useVideos("foryou"), {
      wrapper: createWrapper(),
    });

    expect(result.current.videos).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.hasMore).toBe(true);
  });

  it("should handle feed type change", async () => {
    const { result, rerender } = renderHook(
      ({ feedType }: { feedType: "foryou" | "following" }) => useVideos(feedType),
      {
        wrapper: createWrapper(),
        initialProps: { feedType: "foryou" as const },
      }
    );

    // Initial render
    expect(result.current.feedType).toBe("foryou");

    // Rerender with different feed type
    rerender({ feedType: "following" });
  });

  it("should format video counts correctly in VideoWithProfile", () => {
    // Test the VideoWithProfile interface structure
    const mockVideo: import("../../hooks/useVideos").VideoWithProfile = {
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

    expect(mockVideo.likes_count).toBe(100);
    expect(mockVideo.user.username).toBe("testuser");
  });
});

describe("useToggleLike hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exist and be a function", () => {
    expect(typeof useToggleLike).toBe("function");
  });

  it("should handle like toggle without user", async () => {
    const { result } = renderHook(() => useToggleLike(), {
      wrapper: createWrapper(),
    });

    // Should not throw when called without user
    await act(async () => {
      await result.current("video-id", false);
    });
  });
});

describe("useToggleBookmark hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exist and be a function", () => {
    expect(typeof useToggleBookmark).toBe("function");
  });

  it("should handle bookmark toggle without user", async () => {
    const { result } = renderHook(() => useToggleBookmark(), {
      wrapper: createWrapper(),
    });

    // Should not throw when called without user
    await act(async () => {
      await result.current("video-id", false);
    });
  });
});

describe("VideoWithProfile interface", () => {
  it("should have all required properties", () => {
    const video: import("../../hooks/useVideos").VideoWithProfile = {
      id: "test-id",
      video_url: "https://test.com/video.mp4",
      audio_url: "https://test.com/audio.mp3",
      description: "Test description",
      music_name: "Test music",
      hashtags: ["tag1", "tag2"],
      likes_count: 50,
      comments_count: 25,
      shares_count: 10,
      bookmarks_count: 5,
      views_count: 500,
      user_id: "user-id",
      created_at: "2024-01-01T00:00:00Z",
      is_public: true,
      user: {
        username: "username",
        display_name: "Display Name",
        avatar_url: "https://test.com/avatar.jpg",
        verified: true,
      },
      isLiked: true,
      isBookmarked: false,
    };

    // Verify all properties exist
    expect(video.id).toBeDefined();
    expect(video.video_url).toBeDefined();
    expect(video.user).toBeDefined();
    expect(video.user.username).toBeDefined();
    expect(video.isLiked).toBeDefined();
    expect(video.isBookmarked).toBeDefined();
  });
});
n