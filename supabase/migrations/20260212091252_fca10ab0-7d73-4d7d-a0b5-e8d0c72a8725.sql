
-- Create availability table for weekly recurring slots
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability_overrides for specific date blocks/custom hours
CREATE TABLE public.availability_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS for availability
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own availability"
ON public.availability FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own availability"
ON public.availability FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability"
ON public.availability FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability"
ON public.availability FOR DELETE USING (auth.uid() = user_id);

-- Public read for booking page
CREATE POLICY "Anyone can view availability for booking"
ON public.availability FOR SELECT USING (true);

-- RLS for overrides
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overrides"
ON public.availability_overrides FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own overrides"
ON public.availability_overrides FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own overrides"
ON public.availability_overrides FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own overrides"
ON public.availability_overrides FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view overrides for booking"
ON public.availability_overrides FOR SELECT USING (true);
