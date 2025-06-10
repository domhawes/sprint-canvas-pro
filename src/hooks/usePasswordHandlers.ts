
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordHandlers = () => {
  const [loading, setLoading] = useState(false);
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
      const { data, error } = await supabase.functions.invoke('send-password-recovery', {
        body: { email }
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

  const handlePasswordReset = async (password: string, confirmPassword: string) => {
    console.log('handlePasswordReset called with passwords');
    
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

    setLoading(true);
    try {
      console.log('Checking current session before password update...');
      
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError);
        toast({
          title: "Session expired",
          description: "Your password reset link has expired or is invalid. Please request a new password reset email.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Valid session found, updating password...');
      
      // Update password with the valid session
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      } else {
        console.log('Password updated successfully');
        toast({
          title: "Success",
          description: "Password updated successfully! You are now logged in.",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    handleForgotPassword,
    handlePasswordReset,
  };
};
