-- Add insurance_type column to policies table
ALTER TABLE public.policies 
ADD COLUMN insurance_type text DEFAULT 'Vehicle Insurance' NOT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.policies.insurance_type IS 'Type of insurance: Vehicle Insurance, Health Insurance, Life Insurance, or Other';