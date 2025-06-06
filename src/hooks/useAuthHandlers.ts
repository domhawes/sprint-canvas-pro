
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthHandlers = () => {
  const [loading, setLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Kanbana App',
      });

      if (error) {
        toast({
          title: "Error enabling 2FA",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "2FA Setup",
        description: "Please scan the QR code with your authenticator app and enter the verification code.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error enabling 2FA",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVerifyMFA = async (otpCode: string) => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: otpCode,
        challengeId: otpCode,
        code: otpCode,
      });

      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "2FA verified successfully",
          description: "You are now signed in with 2FA enabled.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully! Please enable 2FA for enhanced security.",
      });
      await handleEnableMFA();
      return true;
    }
  };

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
    loading,
    setLoading,
    linkedinLoading,
    handleForgotPassword,
    handleEnableMFA,
    handleVerifyMFA,
    handlePasswordReset,
    handleSignIn,
    handleLinkedInLogin,
    signUp,
  };
};
