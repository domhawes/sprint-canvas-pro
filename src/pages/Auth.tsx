
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
  const [recoverySessionChecked, setRecoverySessionChecked] = useState(false);
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

  // Handle password recovery detection and session establishment
  useEffect(() => {
    const checkRecoverySession = async () => {
      const type = searchParams.get('type');
      console.log('URL type parameter:', type);
      
      if (type === 'recovery') {
        console.log('Password recovery detected, waiting for session establishment...');
        
        // Give Supabase time to process the recovery token and establish session
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSession = async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log('Session check attempt', attempts + 1, '- Session:', !!session, 'Error:', error);
            
            if (session && !error) {
              console.log('Recovery session established, showing password reset form');
              setIsPasswordReset(true);
              setIsForgotPassword(false);
              setIs2FAStep(false);
              setIsSignUp(false);
              setRecoverySessionChecked(true);
              return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500); // Check again in 500ms
            } else {
              console.error('Failed to establish recovery session after maximum attempts');
              setRecoverySessionChecked(true);
            }
          } catch (error) {
            console.error('Error checking recovery session:', error);
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500);
            } else {
              setRecoverySessionChecked(true);
            }
          }
        };
        
        checkSession();
      } else {
        setRecoverySessionChecked(true);
      }
    };

    if (!loading) {
      checkRecoverySession();
    }
  }, [searchParams, loading]);

  // Show loading spinner while auth is initializing or checking recovery session
  if (loading || (searchParams.get('type') === 'recovery' && !recoverySessionChecked)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">K</span>
          </div>
          <p className="text-gray-600">
            {searchParams.get('type') === 'recovery' ? 'Processing password reset link...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if recovery was attempted but no session was established
  if (searchParams.get('type') === 'recovery' && recoverySessionChecked && !isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <AuthHeader
              title="Invalid Reset Link"
              description="Your password reset link has expired or is invalid"
              showBackButton={true}
              onBack={() => {
                setIsForgotPassword(true);
                // Clear the URL params
                window.history.replaceState({}, '', '/auth');
              }}
            />
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Please request a new password reset email to continue.
            </p>
          </CardContent>
        </Card>
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
    
    if (authLoading) return; // Prevent double submission
    
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
          // Clear the URL params and redirect
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
    // Clear URL params
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
