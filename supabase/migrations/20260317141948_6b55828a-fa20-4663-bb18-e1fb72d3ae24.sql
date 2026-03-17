
-- Create comment_likes table (referenced by CommentsDrawer but doesn't exist)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes viewable by everyone" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can create own comment likes" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment likes" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger: sync likes_count on videos
CREATE OR REPLACE FUNCTION public.sync_video_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + 1) WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_video_likes
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.sync_video_likes_count();

-- Trigger: sync comments_count on videos
CREATE OR REPLACE FUNCTION public.sync_video_comments_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET comments_count = GREATEST(0, COALESCE(comments_count, 0) + 1) WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_video_comments
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.sync_video_comments_count();

-- Trigger: sync bookmarks_count on videos
CREATE OR REPLACE FUNCTION public.sync_video_bookmarks_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET bookmarks_count = GREATEST(0, COALESCE(bookmarks_count, 0) + 1) WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET bookmarks_count = GREATEST(0, COALESCE(bookmarks_count, 0) - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_video_bookmarks
AFTER INSERT OR DELETE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.sync_video_bookmarks_count();

-- Trigger: sync followers_count and following_count on profiles
CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) + 1) WHERE user_id = NEW.following_id;
    UPDATE profiles SET following_count = GREATEST(0, COALESCE(following_count, 0) + 1) WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) - 1) WHERE user_id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, COALESCE(following_count, 0) - 1) WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_follow_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.sync_follow_counts();

-- Trigger: sync likes_count on profiles (total likes received on all videos)
CREATE OR REPLACE FUNCTION public.sync_profile_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  video_owner_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO video_owner_id FROM videos WHERE id = NEW.video_id;
    IF video_owner_id IS NOT NULL THEN
      UPDATE profiles SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + 1) WHERE user_id = video_owner_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT user_id INTO video_owner_id FROM videos WHERE id = OLD.video_id;
    IF video_owner_id IS NOT NULL THEN
      UPDATE profiles SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE user_id = video_owner_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_profile_likes
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_likes_count();

-- Trigger: auto-create notifications for likes, follows, comments
CREATE OR REPLACE FUNCTION public.create_notification_on_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  video_owner_id uuid;
BEGIN
  SELECT user_id INTO video_owner_id FROM videos WHERE id = NEW.video_id;
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, from_user_id, video_id, type, message)
    VALUES (video_owner_id, NEW.user_id, NEW.video_id, 'like', 'liked your video');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_like
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_like();

CREATE OR REPLACE FUNCTION public.create_notification_on_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.following_id != NEW.follower_id THEN
    INSERT INTO notifications (user_id, from_user_id, type, message)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', 'started following you');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_follow();

CREATE OR REPLACE FUNCTION public.create_notification_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  video_owner_id uuid;
BEGIN
  SELECT user_id INTO video_owner_id FROM videos WHERE id = NEW.video_id;
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, from_user_id, video_id, comment_id, type, message)
    VALUES (video_owner_id, NEW.user_id, NEW.video_id, NEW.id, 'comment', 'commented on your video');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_comment();

-- Trigger: increment view count via function (avoids race condition)
CREATE OR REPLACE FUNCTION public.increment_view_count(vid_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE videos SET views_count = GREATEST(0, COALESCE(views_count, 0) + 1) WHERE id = vid_id;
END;
$$;

-- Fix any negative counts that already exist
UPDATE videos SET likes_count = GREATEST(0, COALESCE(likes_count, 0)),
  comments_count = GREATEST(0, COALESCE(comments_count, 0)),
  bookmarks_count = GREATEST(0, COALESCE(bookmarks_count, 0)),
  shares_count = GREATEST(0, COALESCE(shares_count, 0)),
  views_count = GREATEST(0, COALESCE(views_count, 0));

UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0)),
  following_count = GREATEST(0, COALESCE(following_count, 0)),
  likes_count = GREATEST(0, COALESCE(likes_count, 0));
