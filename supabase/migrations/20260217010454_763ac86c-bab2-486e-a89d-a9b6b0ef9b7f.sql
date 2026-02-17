
-- Fix: Restrict platform_settings SELECT to admin users only
-- Drop the overly permissive policy that allows all authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can read platform settings" ON public.platform_settings;

-- Create a new policy that only allows admins to read settings
CREATE POLICY "Only admins can read platform settings"
ON public.platform_settings
FOR SELECT
USING (is_admin(auth.uid()));
