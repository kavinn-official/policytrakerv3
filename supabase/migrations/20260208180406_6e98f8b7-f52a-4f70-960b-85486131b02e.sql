-- Fix the support_tickets INSERT policy to be more specific
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;

-- Create a more restrictive policy - allow authenticated users and anonymous for enquiry
CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role to insert (for edge functions)
CREATE POLICY "Service role can create tickets"
ON public.support_tickets FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);