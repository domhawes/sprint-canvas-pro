
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProjectInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  accepted_at?: string;
  expires_at: string;
}

export const useProjectInvitations = (projectId: string) => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvitations = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error fetching invitations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (email: string, role: string, projectName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          projectId,
          email,
          role,
          projectName
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      fetchInvitations();
      return true;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });

      fetchInvitations();
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error cancelling invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [projectId, user]);

  return {
    invitations,
    loading,
    sendInvitation,
    deleteInvitation,
    refetch: fetchInvitations,
  };
};
