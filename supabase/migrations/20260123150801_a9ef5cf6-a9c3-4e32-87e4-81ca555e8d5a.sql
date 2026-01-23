-- Fix 1: Add RLS policies to rate_limits table for service role access
-- The rate_limits table is managed by edge functions using service role,
-- but we need policies to prevent direct anonymous access
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Fix 2: Add DELETE policy to subscriptions table to prevent deletion (audit trail)
CREATE POLICY "Prevent deletion of subscription records"
ON public.subscriptions
FOR DELETE
USING (false);

-- Fix 3: Update all existing RLS policies to explicitly block anonymous access
-- Drop and recreate policies with auth.uid() IS NOT NULL check

-- POLICIES table
DROP POLICY IF EXISTS "Users can view their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can create their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can update their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can delete their own policies" ON public.policies;

CREATE POLICY "Users can view their own policies"
ON public.policies FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own policies"
ON public.policies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own policies"
ON public.policies FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies"
ON public.policies FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- PROFILES table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- CLIENTS table
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients"
ON public.clients FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
ON public.clients FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
ON public.clients FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- SUBSCRIPTIONS table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- SUBSCRIBERS table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
ON public.subscribers FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- USER_SETTINGS table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- PAYMENT_REQUESTS table
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public.payment_requests;

CREATE POLICY "Users can view their own payment requests"
ON public.payment_requests FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests"
ON public.payment_requests FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests"
ON public.payment_requests FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- WHATSAPP_REMINDER_LOGS table
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can create their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can delete their own reminder logs" ON public.whatsapp_reminder_logs;

CREATE POLICY "Users can view their own reminder logs"
ON public.whatsapp_reminder_logs FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder logs"
ON public.whatsapp_reminder_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder logs"
ON public.whatsapp_reminder_logs FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);