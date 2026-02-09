
-- Fix 1: Restrict platform_settings to authenticated users only (was publicly readable)
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
CREATE POLICY "Authenticated users can read platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix 2: Tighten email_logs user SELECT to handle NULL recipient_user_id
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
CREATE POLICY "Users can view their own email logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (recipient_user_id IS NOT NULL AND auth.uid() = recipient_user_id);
