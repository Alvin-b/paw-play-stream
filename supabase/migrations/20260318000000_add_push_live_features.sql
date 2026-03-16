-- Add push_subscriptions table for web push notifications

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Add is_live column to videos for live streaming feature
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Add live viewers count
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS live_viewers INTEGER DEFAULT 0;

-- Add live streams table for active broadcasts
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  stream_key TEXT,
  is_active BOOLEAN DEFAULT true,
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams are viewable by everyone"
  ON public.live_streams FOR SELECT USING (true);

CREATE POLICY "Users can create own live streams"
  ON public.live_streams FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own live streams"
  ON public.live_streams FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
