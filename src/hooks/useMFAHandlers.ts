
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMFAHandlers = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return {
    loading,
    setLoading,
    handleEnableMFA,
    handleVerifyMFA,
  };
};
