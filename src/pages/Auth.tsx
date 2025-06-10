
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { SignInForm } from '@/components/auth/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoadingRecovery, setIsLoadingRecovery] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    loading: authLoading,
    setLoading,
    linkedinLoading,
    handleForgotPassword,
    handleVerifyMFA,
    handlePasswordReset,
    handleSignIn,
    handleLinkedInLogin,
    signUp,
  } = useAuthHandlers();

  // Handle user authentication redirect
  useEffect(() => {
    if (!loading && user && !isPasswordReset) {
      console.log('User authenticated, redirecting to dashboard...');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate, isPasswordReset]);

  // Handle password recovery detection
  useEffect(() => {
    const type = searchParams.get('type');
    console.log('URL type parameter:', type);
    
    if (type === 'recovery') {
      console.log('Recovery type detected, setting password reset mode');
      setIsLoadingRecovery(true);
      setIsPasswordReset(true);
      setIsForgotPassword(false);
      setIs2FAStep(false);
      setIsSignUp(false);
      
      // Check if we have a valid session after a short delay
      setTimeout(async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Recovery session check:', { session: !!session, error });
          
          if (!session || error) {
            console.log('No valid recovery session found');
            setIsPasswordReset(false);
            setIsForgotPassword(true);
          }
        } catch (error) {
          console.error('Error checking recovery session:', error);
          setIsPasswordReset(false);
          setIsForgotPassword(true);
        } finally {
          setIsLoadingRecovery(false);
        }
      }, 1000);
    }
  }, [searchParams]);

  // Show loading spinner while auth is initializing or checking recovery
  if (loading || isLoadingRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">K</span>
          </div>
          <p className="text-gray-600">
            {isLoadingRecovery ? 'Processing password reset link...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, current state:', { 
      isForgotPassword, 
      is2FAStep, 
      isPasswordReset, 
      isSignUp 
    });
    
    if (authLoading) return;
    
    setLoading(true);

    try {
      if (isForgotPassword) {
        console.log('Processing forgot password request');
        await handleForgotPassword(email);
        setIsForgotPassword(false);
        return;
      }

      if (is2FAStep) {
        console.log('Processing 2FA verification');
        await handleVerifyMFA(otpCode);
        setIs2FAStep(false);
        return;
      }

      if (isPasswordReset) {
        console.log('Processing password reset');
        const success = await handlePasswordReset(password, confirmPassword);
        if (success) {
          console.log('Password reset successful, redirecting to dashboard');
          setIsPasswordReset(false);
          setPassword('');
          setConfirmPassword('');
          window.history.replaceState({}, '', '/auth');
          navigate('/', { replace: true });
        }
      } else if (isSignUp) {
        console.log('Processing sign up');
        await signUp(email, password, fullName);
      } else {
        console.log('Processing sign in');
        const result = await handleSignIn(email, password);
        if (result?.requires2FA) {
          setIs2FAStep(true);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Reset Password';
    if (isPasswordReset) return 'Set New Password';
    if (is2FAStep) return 'Enter 2FA Code';
    return isSignUp ? 'Join Kanbana' : 'Welcome back';
  };

  const getDescription = () => {
    if (isForgotPassword) return 'Enter your email to receive a password reset link';
    if (isPasswordReset) return 'Enter your new password to continue';
    if (is2FAStep) return 'Enter the 6-digit code from your authenticator app';
    return isSignUp 
      ? 'Create your account to get started' 
      : 'Sign in to your account to continue';
  };

  const resetToSignIn = () => {
    setIsForgotPassword(false);
    setIsPasswordReset(false);
    setIs2FAStep(false);
    setIsSignUp(false);
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setFullName('');
    window.history.replaceState({}, '', '/auth');
  };

  const renderForm = () => {
    if (is2FAStep) {
      return (
        <TwoFactorForm
          otpCode={otpCode}
          loading={authLoading}
          onOtpChange={setOtpCode}
          onSubmit={handleSubmit}
        />
      );
    }

    if (isForgotPassword) {
      return (
        <ForgotPasswordForm
          email={email}
          loading={authLoading}
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
        />
      );
    }

    if (isPasswordReset) {
      return (
        <PasswordResetForm
          password={password}
          confirmPassword={confirmPassword}
          loading={authLoading}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
        />
      );
    }

    return (
      <SignInForm
        email={email}
        password={password}
        fullName={fullName}
        isSignUp={isSignUp}
        loading={authLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onFullNameChange={setFullName}
        onSubmit={handleSubmit}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AuthHeader
            title={getTitle()}
            description={getDescription()}
            showBackButton={isForgotPassword || is2FAStep}
            onBack={resetToSignIn}
          />
        </CardHeader>
        <CardContent>
          {!isPasswordReset && !isForgotPassword && !is2FAStep && (
            <>
              <SocialAuthButtons
                linkedinLoading={linkedinLoading}
                onLinkedInLogin={handleLinkedInLogin}
              />
              <div className="mt-4">
                {renderForm()}
              </div>
            </>
          )}
          
          {(isPasswordReset || isForgotPassword || is2FAStep) && renderForm()}
          
          <AuthFooter
            isSignUp={isSignUp}
            isForgotPassword={isForgotPassword}
            isPasswordReset={isPasswordReset}
            is2FAStep={is2FAStep}
            onToggleSignUp={() => setIsSignUp(!isSignUp)}
            onForgotPassword={() => setIsForgotPassword(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
