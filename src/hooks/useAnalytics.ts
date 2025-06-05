
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackEvent = useMutation({
    mutationFn: async ({ eventType, eventData }: { eventType: string; eventData?: any }) => {
      if (!user) {
        console.log('Cannot track event: user not authenticated');
        return;
      }
      
      try {
        const { data, error } = await supabase.rpc('track_user_event', {
          p_user_id: user.id,
          p_event_type: eventType,
          p_event_data: eventData ? JSON.stringify(eventData) : null,
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error tracking event:', error);
        throw error;
      }
    },
  });

  const getUserAnalytics = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getUserSessions = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_start', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    trackEvent,
    getUserAnalytics,
    getUserSessions,
  };
};
