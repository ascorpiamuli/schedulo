
-- Create event_types table
CREATE TABLE public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  location_type TEXT NOT NULL DEFAULT 'video',
  location_details TEXT,
  color TEXT NOT NULL DEFAULT '#7C3AED',
  buffer_before INTEGER NOT NULL DEFAULT 0,
  buffer_after INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  price_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Enable RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can view their own event types"
ON public.event_types FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event types"
ON public.event_types FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event types"
ON public.event_types FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event types"
ON public.event_types FOR DELETE
USING (auth.uid() = user_id);

-- Public can view active event types (for booking pages)
CREATE POLICY "Anyone can view active event types"
ON public.event_types FOR SELECT
USING (is_active = true);

-- Updated_at trigger
CREATE TRIGGER update_event_types_updated_at
BEFORE UPDATE ON public.event_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
