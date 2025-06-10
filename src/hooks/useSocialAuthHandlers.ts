
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSocialAuthHandlers = () => {
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    setLinkedinLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('LinkedIn login error:', error);
      }
    } catch (error) {
      console.error('LinkedIn login error:', error);
    } finally {
      setLinkedinLoading(false);
    }
  };

  return {
    linkedinLoading,
    handleLinkedInLogin,
  };
};
