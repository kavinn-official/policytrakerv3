
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to read all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.subscribers FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to read all policies
CREATE POLICY "Admins can view all policies"
ON public.policies FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to read all usage tracking
CREATE POLICY "Admins can view all usage"
ON public.usage_tracking FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to read all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (is_admin(auth.uid()));
