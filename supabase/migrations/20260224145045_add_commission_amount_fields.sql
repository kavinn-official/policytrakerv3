-- Add amount fields for commission tracking
ALTER TABLE public.policies
ADD COLUMN od_commission_amount numeric(10,2) DEFAULT null,
ADD COLUMN tp_commission_amount numeric(10,2) DEFAULT null,
ADD COLUMN net_commission_amount numeric(10,2) DEFAULT null,
ADD COLUMN commission_amount numeric(10,2) DEFAULT null;
