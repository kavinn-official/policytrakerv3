-- Add new premium and commission fields to policies table
ALTER TABLE public.policies
ADD COLUMN IF NOT EXISTS basic_od_premium numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS basic_tp_premium numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS od_commission_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tp_commission_percentage numeric DEFAULT 0;