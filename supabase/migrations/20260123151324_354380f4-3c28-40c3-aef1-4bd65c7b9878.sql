-- Fix rate_limits table: Remove user access policy and block all direct access
-- Rate limits should ONLY be managed by edge functions using service role
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Block ALL user access - rate limits are managed exclusively by service role in edge functions
CREATE POLICY "Block all user access to rate limits"
ON public.rate_limits
FOR ALL
USING (false);