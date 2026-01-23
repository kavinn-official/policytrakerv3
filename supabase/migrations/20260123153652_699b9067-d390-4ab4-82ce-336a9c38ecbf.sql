-- Fix RLS policies: Convert all RESTRICTIVE policies to PERMISSIVE policies
-- RESTRICTIVE policies alone block all access - need at least one PERMISSIVE policy per table/operation

-- =====================
-- TABLE: policies
-- =====================
DROP POLICY IF EXISTS "Users can view their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can create their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can update their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can delete their own policies" ON public.policies;

CREATE POLICY "Users can view their own policies" ON public.policies
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own policies" ON public.policies
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" ON public.policies
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies" ON public.policies
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: profiles
-- =====================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- =====================
-- TABLE: clients
-- =====================
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients" ON public.clients
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON public.clients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: subscriptions
-- =====================
DROP POLICY IF EXISTS "Prevent deletion of subscription records" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Keep subscription deletion blocked (intentional restriction)
CREATE POLICY "Prevent deletion of subscription records" ON public.subscriptions
FOR DELETE USING (false);

-- =====================
-- TABLE: subscribers
-- =====================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" ON public.subscribers
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: user_settings
-- =====================
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.user_settings
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: payment_requests
-- =====================
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public.payment_requests;

CREATE POLICY "Users can view their own payment requests" ON public.payment_requests
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON public.payment_requests
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests" ON public.payment_requests
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: whatsapp_reminder_logs
-- =====================
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can create their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can delete their own reminder logs" ON public.whatsapp_reminder_logs;

CREATE POLICY "Users can view their own reminder logs" ON public.whatsapp_reminder_logs
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder logs" ON public.whatsapp_reminder_logs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder logs" ON public.whatsapp_reminder_logs
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================
-- TABLE: rate_limits (keep RESTRICTIVE - blocks all direct access, managed by service role only)
-- =====================
-- Keep as is - rate_limits should only be accessible by service role in edge functions