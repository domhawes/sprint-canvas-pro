
import React from 'react';
import { Button } from "@/components/ui/button";

interface AuthFooterProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  isPasswordReset: boolean;
  is2FAStep: boolean;
  onToggleSignUp: () => void;
  onForgotPassword: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  isSignUp,
  isForgotPassword,
  isPasswordReset,
  is2FAStep,
  onToggleSignUp,
  onForgotPassword,
}) => {
  if (isPasswordReset || is2FAStep) {
    return null;
  }

  return (
    <div className="mt-6 text-center space-y-2">
      {!isForgotPassword && (
        <>
          <Button
            variant="link"
            onClick={onToggleSignUp}
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
                onClick={onForgotPassword}
                className="text-sm text-muted-foreground"
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
