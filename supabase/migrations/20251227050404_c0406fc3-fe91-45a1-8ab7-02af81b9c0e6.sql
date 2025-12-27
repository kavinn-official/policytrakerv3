-- Add whatsapp_reminder_count to policies table to track how many reminders were sent
ALTER TABLE public.policies 
ADD COLUMN whatsapp_reminder_count INTEGER NOT NULL DEFAULT 0;

-- Create an index for efficient querying
CREATE INDEX idx_policies_created_at ON public.policies (created_at);