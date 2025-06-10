
import { usePasswordHandlers } from '@/hooks/usePasswordHandlers';
import { useMFAHandlers } from '@/hooks/useMFAHandlers';
import { useSocialAuthHandlers } from '@/hooks/useSocialAuthHandlers';
import { useSignInHandlers } from '@/hooks/useSignInHandlers';

export const useAuthHandlers = () => {
  const {
    loading: passwordLoading,
    setLoading: setPasswordLoading,
    handleForgotPassword,
    handlePasswordReset,
  } = usePasswordHandlers();

  const {
    loading: mfaLoading,
    setLoading: setMfaLoading,
    handleEnableMFA,
    handleVerifyMFA,
  } = useMFAHandlers();

  const {
    linkedinLoading,
    handleLinkedInLogin,
  } = useSocialAuthHandlers();

  const {
    handleSignIn,
    signUp,
  } = useSignInHandlers();

  // Use password loading as the main loading state for backward compatibility
  const loading = passwordLoading || mfaLoading;
  const setLoading = (value: boolean) => {
    setPasswordLoading(value);
    setMfaLoading(value);
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
