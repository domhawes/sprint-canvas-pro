
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    loading,
    setLoading,
    linkedinLoading,
    handleForgotPassword,
    handleVerifyMFA,
    handlePasswordReset,
    handleSignIn,
    handleLinkedInLogin,
    signUp,
  } = useAuthHandlers();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await handleForgotPassword(email);
        setIsForgotPassword(false);
        return;
      }

      if (is2FAStep) {
        await handleVerifyMFA(otpCode);
        setIs2FAStep(false);
        return;
      }

      if (isPasswordReset) {
        const success = await handlePasswordReset(password, confirmPassword);
        if (success) {
          setIsPasswordReset(false);
          setPassword('');
          setConfirmPassword('');
          setIs2FAStep(true);
        }
      } else if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        const result = await handleSignIn(email, password);
        if (result.requires2FA) {
          setIs2FAStep(true);
        }
      }
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
    if (isPasswordReset) return 'Enter your new password and enable 2FA';
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
  };

  const renderForm = () => {
    if (is2FAStep) {
      return (
        <TwoFactorForm
          otpCode={otpCode}
          loading={loading}
          onOtpChange={setOtpCode}
          onSubmit={handleSubmit}
        />
      );
    }

    if (isForgotPassword) {
      return (
        <ForgotPasswordForm
          email={email}
          loading={loading}
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
          loading={loading}
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
        loading={loading}
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
