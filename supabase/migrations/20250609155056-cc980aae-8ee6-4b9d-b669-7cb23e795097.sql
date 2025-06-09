
-- Create a table for project attachments
CREATE TABLE public.project_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for project attachments
CREATE POLICY "Users can view attachments of their projects" 
  ON public.project_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_attachments.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload attachments to their projects" 
  ON public.project_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_attachments.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments from their projects" 
  ON public.project_attachments 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_attachments.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Create storage bucket for project attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-attachments', 'project-attachments', false);

-- Create storage policies
CREATE POLICY "Users can upload to project attachments bucket"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'project-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view project attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete project attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-attachments' AND
  auth.role() = 'authenticated'
);
