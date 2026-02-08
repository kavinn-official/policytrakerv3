-- Add commission tracking columns to policies table
ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS commission_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_year_commission numeric GENERATED ALWAYS AS (
  CASE WHEN net_premium IS NOT NULL AND commission_percentage IS NOT NULL 
  THEN ROUND((net_premium * commission_percentage / 100)::numeric, 2)
  ELSE 0 END
) STORED,
ADD COLUMN IF NOT EXISTS premium_frequency text DEFAULT 'yearly',
ADD COLUMN IF NOT EXISTS sum_insured numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS members_covered integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_type text,
ADD COLUMN IF NOT EXISTS sum_assured numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS policy_term integer,
ADD COLUMN IF NOT EXISTS premium_payment_term integer,
ADD COLUMN IF NOT EXISTS idv numeric DEFAULT 0;

-- Create usage_tracking table for subscription limits
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  ocr_scans_used integer NOT NULL DEFAULT 0,
  storage_used_bytes bigint NOT NULL DEFAULT 0,
  month_year text NOT NULL, -- Format: YYYY-MM for monthly reset
  last_backup_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS on usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON public.usage_tracking(user_id, month_year);

-- Add trigger for updated_at on usage_tracking
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();