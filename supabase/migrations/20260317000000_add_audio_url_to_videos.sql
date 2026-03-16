-- Add audio_url column to videos table
ALTER TABLE public.videos ADD COLUMN audio_url TEXT DEFAULT '';