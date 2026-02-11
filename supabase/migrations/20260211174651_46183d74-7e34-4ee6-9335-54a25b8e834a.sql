
-- Allow admins to update subscribers (for upgrade/suspend actions)
CREATE POLICY "Admins can update subscribers"
ON public.subscribers FOR UPDATE
USING (is_admin(auth.uid()));

-- Allow admins to insert subscribers (for creating new subscriber records)
CREATE POLICY "Admins can insert subscribers"
ON public.subscribers FOR INSERT
WITH CHECK (is_admin(auth.uid()));
