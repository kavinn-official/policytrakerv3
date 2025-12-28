-- Add net_premium column to policies table
ALTER TABLE public.policies 
ADD COLUMN net_premium numeric DEFAULT 0;

-- Create index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON public.policies(created_at);

-- Update RLS policy to include new column (policies are already covered by existing RLS)