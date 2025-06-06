import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Linkedin, ArrowLeft } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if this is a password recovery link
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

  const handleForgotPassword = async () => {
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
        setIsForgotPassword(false);
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

      // Show QR code and secret to user
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

  const handleVerifyMFA = async () => {
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
        factorId: otpCode, // This should be the factor ID from enrollment
        challengeId: otpCode, // This should be the challenge ID
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
        setIs2FAStep(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await handleForgotPassword();
        return;
      }

      if (is2FAStep) {
        await handleVerifyMFA();
        return;
      }

      if (isPasswordReset) {
        // Handle password reset with 2FA
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return;
        }

        if (password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
          return;
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
        } else {
          toast({
            title: "Success",
            description: "Password updated successfully! Please enable 2FA for enhanced security.",
          });
          
          // Reset form and switch to 2FA setup
          setIsPasswordReset(false);
          setPassword('');
          setConfirmPassword('');
          setIs2FAStep(true);
          await handleEnableMFA();
        }
      } else if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        const result = await signIn(email, password);
        
        // Check if 2FA is required
        if (!result.error) {
          // Check if user has MFA enabled
          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (factors && factors.all && factors.all.length > 0) {
            setIs2FAStep(true);
            return;
          }
        }
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            {(isForgotPassword || is2FAStep) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToSignIn}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div className="w-8"></div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isPasswordReset && !isForgotPassword && !is2FAStep && (
            <div className="space-y-4">
              <Button
                onClick={handleLinkedInLogin}
                disabled={linkedinLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                {linkedinLoading ? 'Connecting...' : 'Continue with LinkedIn'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 ${!isPasswordReset && !isForgotPassword && !is2FAStep ? 'mt-4' : ''}`}>
            {is2FAStep ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Authentication Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otpCode}
                      onChange={setOtpCode}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </div>
            ) : isForgotPassword ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : isPasswordReset ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (
                isForgotPassword ? 'Send Reset Link' :
                isPasswordReset ? 'Update Password & Enable 2FA' : 
                is2FAStep ? 'Verify Code' :
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>
          
          {!isPasswordReset && !is2FAStep && (
            <div className="mt-6 text-center space-y-2">
              {!isForgotPassword && (
                <>
                  <Button
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                  {!isSignUp && (
                    <div>
                      <Button
                        variant="link"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-muted-foreground"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
