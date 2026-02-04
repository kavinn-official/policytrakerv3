-- Update all existing CHOLAMANDALAM variations to "Cholamandalam" in the policies table
UPDATE public.policies 
SET company_name = 'Cholamandalam'
WHERE UPPER(company_name) LIKE '%CHOLAMANDALAM%'
   OR UPPER(company_name) LIKE '%CHOLA MS%'
   OR UPPER(company_name) LIKE '%CHOLA %'
   OR company_name = 'CHOLA';

-- Also update any other common variations
UPDATE public.policies 
SET company_name = 'Cholamandalam'
WHERE company_name ILIKE '%CHOLAMANDALAM MS GENERAL INSURANCE%';