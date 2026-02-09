
-- Create demo_requests table
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_type TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view all demo requests
CREATE POLICY "Admins can view demo requests"
  ON public.demo_requests FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update demo requests
CREATE POLICY "Admins can update demo requests"
  ON public.demo_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- Allow service role (edge functions) to insert - no auth required for public form
CREATE POLICY "Anyone can create demo requests"
  ON public.demo_requests FOR INSERT
  WITH CHECK (true);

-- Prevent deletion
CREATE POLICY "No one can delete demo requests"
  ON public.demo_requests FOR DELETE
  USING (false);
