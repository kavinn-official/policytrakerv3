-- Add new columns for enhanced reminder settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS reminder_frequency text DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS reminder_time text DEFAULT 'morning',
ADD COLUMN IF NOT EXISTS custom_reminder_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS cron_job_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS last_cron_execution timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.user_settings.reminder_frequency IS 'daily, weekly, or custom';
COMMENT ON COLUMN public.user_settings.reminder_time IS 'morning, afternoon, evening, or custom';
COMMENT ON COLUMN public.user_settings.custom_reminder_time IS 'custom time in HH:MM format';
COMMENT ON COLUMN public.user_settings.cron_job_status IS 'active or inactive';
COMMENT ON COLUMN public.user_settings.last_cron_execution IS 'timestamp of last cron job execution';