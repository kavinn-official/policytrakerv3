-- Allow admins to update subscriptions
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (is_admin(auth.uid()));

-- Allow admins to insert subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (is_admin(auth.uid()));