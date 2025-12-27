-- Add DELETE policy for whatsapp_reminder_logs table
-- This allows users to delete their own reminder logs for GDPR compliance

CREATE POLICY "Users can delete their own reminder logs" 
ON public.whatsapp_reminder_logs 
FOR DELETE 
USING (auth.uid() = user_id);