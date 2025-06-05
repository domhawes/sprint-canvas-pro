
import React from 'react';

interface WelcomeHeaderProps {
  userName: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Welcome back, {userName}! 👋
      </h1>
      <p className="text-xl text-gray-600">
        Manage your projects and stay productive
      </p>
    </div>
  );
};

export default WelcomeHeader;
