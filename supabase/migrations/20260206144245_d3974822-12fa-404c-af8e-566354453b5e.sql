-- Add DELETE policy to subscribers table to prevent deletion of subscription records
-- This matches the pattern used for the 'subscriptions' table

CREATE POLICY "Prevent deletion of subscriber records"
ON public.subscribers
FOR DELETE
USING (false);