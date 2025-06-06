
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  description: string;
  showBackButton: boolean;
  onBack: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  description,
  showBackButton,
  onBack,
}) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
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
        {title}
      </CardTitle>
      <CardDescription>
        {description}
      </CardDescription>
    </div>
  );
};
