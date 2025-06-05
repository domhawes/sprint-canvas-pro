
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getProfile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importFromLinkedIn = useMutation({
    mutationFn: async (linkedinData: any) => {
      if (!user) throw new Error('No user');
      
      const profileUpdate = {
        full_name: linkedinData.name,
        job_title: linkedinData.headline,
        bio: linkedinData.summary,
        location: linkedinData.location?.name,
        linkedin_url: linkedinData.publicProfileUrl,
        linkedin_imported_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileUpdate,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile imported from LinkedIn successfully",
      });
    },
  });

  return {
    profile: getProfile.data,
    isLoading: getProfile.isLoading,
    updateProfile,
    importFromLinkedIn,
  };
};
