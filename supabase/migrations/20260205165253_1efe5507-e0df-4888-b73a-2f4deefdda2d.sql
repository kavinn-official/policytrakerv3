-- Add DELETE policy for user_settings table for GDPR compliance
CREATE POLICY "Users can delete their own settings" 
ON public.user_settings 
FOR DELETE 
USING (auth.uid() = user_id);