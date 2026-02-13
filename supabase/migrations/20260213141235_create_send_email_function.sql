-- Enable the pg_net extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL DEFAULT 'guest',
  subject TEXT,
  html_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_logs;
CREATE POLICY "Service role can manage email logs"
  ON public.email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view email logs for their bookings" ON public.email_logs;
CREATE POLICY "Users can view email logs for their bookings"
  ON public.email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = email_logs.booking_id
      AND b.host_user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS update_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a simple function to log emails (no external dependencies)
CREATE OR REPLACE FUNCTION public.send_email(
  recipient TEXT,
  subject TEXT,
  html_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  result JSONB;
BEGIN
  -- Insert into email_logs
  INSERT INTO public.email_logs (
    recipient_email,
    subject,
    html_content,
    status,
    created_at
  ) VALUES (
    recipient,
    subject,
    html_content,
    'logged',
    NOW()
  )
  RETURNING id INTO log_id;
  
  -- Return success
  result := jsonb_build_object(
    'success', true, 
    'message', 'Email logged successfully',
    'log_id', log_id
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  result := jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.send_email TO service_role;
GRANT EXECUTE ON FUNCTION public.send_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_email TO anon;

-- Grant table permissions
GRANT ALL ON public.email_logs TO service_role;
GRANT SELECT, INSERT ON public.email_logs TO authenticated;
GRANT SELECT ON public.email_logs TO anon;