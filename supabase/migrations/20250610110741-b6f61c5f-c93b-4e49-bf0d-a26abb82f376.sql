
-- Create invitations table to track pending invites
CREATE TABLE public.project_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role project_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Enable RLS on invitations table
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for projects they're members of
CREATE POLICY "Users can view project invitations for their projects" 
  ON public.project_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_invitations.project_id 
      AND user_id = auth.uid()
    )
  );

-- Policy: Users can create invitations for projects they can manage
CREATE POLICY "Users can create invitations for manageable projects" 
  ON public.project_invitations 
  FOR INSERT 
  WITH CHECK (
    public.user_can_manage_project(project_id, auth.uid())
  );

-- Policy: Users can update invitations for projects they can manage
CREATE POLICY "Users can update invitations for manageable projects" 
  ON public.project_invitations 
  FOR UPDATE 
  USING (
    public.user_can_manage_project(project_id, auth.uid())
  );

-- Policy: Users can delete invitations for projects they can manage
CREATE POLICY "Users can delete invitations for manageable projects" 
  ON public.project_invitations 
  FOR DELETE 
  USING (
    public.user_can_manage_project(project_id, auth.uid())
  );

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_project_invitation(invitation_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  existing_member UUID;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record 
  FROM public.project_invitations 
  WHERE token = invitation_token 
  AND expires_at > now() 
  AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  SELECT id INTO existing_member 
  FROM public.project_members 
  WHERE project_id = invitation_record.project_id 
  AND user_id = auth.uid();
  
  IF existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'You are already a member of this project');
  END IF;
  
  -- Add user to project
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (invitation_record.project_id, auth.uid(), invitation_record.role);
  
  -- Mark invitation as accepted
  UPDATE public.project_invitations 
  SET accepted_at = now() 
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object('success', true, 'project_id', invitation_record.project_id);
END;
$$;
