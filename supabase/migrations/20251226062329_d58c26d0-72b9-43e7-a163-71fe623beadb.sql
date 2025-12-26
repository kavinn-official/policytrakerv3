-- Add mobile_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number text;

-- Update handle_new_user function to include mobile_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, mobile_number)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'mobile_number', '')
  );
  RETURN new;
END;
$$;