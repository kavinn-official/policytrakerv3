
-- Add product_name column to policies table
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT NULL;
