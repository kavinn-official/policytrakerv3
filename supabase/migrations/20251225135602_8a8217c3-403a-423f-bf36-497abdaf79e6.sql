-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false);

-- Create RLS policies for policy-documents bucket
-- Users can upload their own documents
CREATE POLICY "Users can upload their own policy documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own documents
CREATE POLICY "Users can view their own policy documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own policy documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add document_url column to policies table
ALTER TABLE public.policies
ADD COLUMN document_url TEXT;