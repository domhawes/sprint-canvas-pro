
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSignInHandlers = () => {
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    
    if (!result.error) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.all && factors.all.length > 0) {
        return { requires2FA: true };
      }
    }
    return { requires2FA: false };
  };

  return {
    handleSignIn,
    signUp,
  };
};
