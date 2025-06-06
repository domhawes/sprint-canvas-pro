
import React from 'react';
import { Button } from "@/components/ui/button";
import { Linkedin } from 'lucide-react';

interface SocialAuthButtonsProps {
  linkedinLoading: boolean;
  onLinkedInLogin: () => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  linkedinLoading,
  onLinkedInLogin,
}) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onLinkedInLogin}
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
  );
};
