
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProjectMember {
  user_id: string;
  role: string;
  profile?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          profile:profiles!project_members_user_id_fkey(
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.log('Error fetching project members:', error);
      toast({
        title: "Error fetching project members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId, user]);

  return {
    members,
    loading,
    refetch: fetchMembers,
  };
};
