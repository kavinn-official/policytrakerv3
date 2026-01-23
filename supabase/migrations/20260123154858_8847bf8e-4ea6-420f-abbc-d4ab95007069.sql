-- Fix RLS policies: Ensure all user-data policies are PERMISSIVE (not RESTRICTIVE)
-- In Supabase, RESTRICTIVE policies alone don't grant access - need PERMISSIVE policies

-- =====================
-- TABLE: policies
-- =====================
DROP POLICY IF EXISTS "Users can view their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can create their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can update their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can delete their own policies" ON public.policies;

CREATE POLICY "Users can view their own policies" ON public.policies
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policies" ON public.policies
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" ON public.policies
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies" ON public.policies
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- =====================
-- TABLE: profiles
-- =====================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE TO authenticated
USING (auth.uid() = id);

-- =====================
-- TABLE: user_settings
-- =====================
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.user_settings
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- =====================
-- TABLE: clients
-- =====================
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients" ON public.clients
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- =====================
-- TABLE: subscriptions
-- =====================
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Prevent deletion of subscription records" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Keep subscription deletion blocked
CREATE POLICY "Prevent deletion of subscription records" ON public.subscriptions
FOR DELETE TO authenticated
USING (false);

-- =====================
-- TABLE: subscribers
-- =====================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" ON public.subscribers
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- =====================
-- TABLE: payment_requests
-- =====================
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public.payment_requests;

CREATE POLICY "Users can view their own payment requests" ON public.payment_requests
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON public.payment_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests" ON public.payment_requests
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- =====================
-- TABLE: whatsapp_reminder_logs
-- =====================
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can create their own reminder logs" ON public.whatsapp_reminder_logs;
DROP POLICY IF EXISTS "Users can delete their own reminder logs" ON public.whatsapp_reminder_logs;

CREATE POLICY "Users can view their own reminder logs" ON public.whatsapp_reminder_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminder logs" ON public.whatsapp_reminder_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder logs" ON public.whatsapp_reminder_logs
FOR DELETE TO authenticated
USING (auth.uid() = user_id);