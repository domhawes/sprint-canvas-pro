
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
      
      // Try to fetch with profile join first
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          profiles!project_members_user_id_fkey(
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.log('Project members query error:', error);
        // Fallback to fetch without profile join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('project_members')
          .select('user_id, role')
          .eq('project_id', projectId);

        if (fallbackError) throw fallbackError;

        const mappedMembers: ProjectMember[] = (fallbackData || []).map(member => ({
          user_id: member.user_id,
          role: member.role,
          profile: undefined
        }));

        setMembers(mappedMembers);
        return;
      }

      // Map members with proper structure
      const mappedMembers: ProjectMember[] = (data || []).map(member => {
        const profileData = member.profiles && member.profiles !== null && typeof member.profiles === 'object' && Object.prototype.hasOwnProperty.call(member.profiles, 'full_name')
          ? member.profiles as { full_name?: string; email?: string; avatar_url?: string }
          : null;

        return {
          user_id: member.user_id,
          role: member.role,
          profile: profileData ? {
            full_name: profileData.full_name,
            email: profileData.email,
            avatar_url: profileData.avatar_url
          } : undefined
        };
      });

      setMembers(mappedMembers);
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
