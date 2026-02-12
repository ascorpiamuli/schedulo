
-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_notes TEXT,
  guest_timezone TEXT NOT NULL DEFAULT 'America/New_York',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'none',
  payment_amount_cents INTEGER DEFAULT 0,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Host can manage their bookings
CREATE POLICY "Hosts can view their bookings"
ON public.bookings FOR SELECT USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their bookings"
ON public.bookings FOR UPDATE USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their bookings"
ON public.bookings FOR DELETE USING (auth.uid() = host_user_id);

-- Anyone can create a booking (public booking page)
CREATE POLICY "Anyone can create bookings"
ON public.bookings FOR INSERT WITH CHECK (true);

-- Anyone can view their own booking by id (for confirmation)
CREATE POLICY "Anyone can view bookings"
ON public.bookings FOR SELECT USING (true);

-- Updated_at trigger
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
