
import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteImage } from '@/hooks/useSiteImages';
import UserMenu from './UserMenu';
import ProfileModal from './ProfileModal';

interface NavbarProps {
  currentView: string;
  onBackToDashboard: () => void;
  selectedProject?: any;
  onProjectAdmin?: () => void;
}

const Navbar = ({ currentView, onBackToDashboard, selectedProject, onProjectAdmin }: NavbarProps) => {
  const { signOut } = useAuth();
  const { data: logoImage } = useSiteImage('kanbana-logo');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const logoSrc = logoImage?.file_path || "/lovable-uploads/1ae6e39e-b18f-4f6f-8fcc-b6c12da96833.png";

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentView === 'kanban' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToDashboard}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <img 
                  src={logoSrc}
                  alt="Kanbana Logo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    // Fallback to original image if logo fails to load
                    e.currentTarget.src = "/lovable-uploads/1ae6e39e-b18f-4f6f-8fcc-b6c12da96833.png";
                  }}
                />
                <h1 className="text-xl font-bold text-gray-900">
                  {currentView === 'kanban' && selectedProject 
                    ? selectedProject.name 
                    : 'Kanbana'
                  }
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentView === 'kanban' && selectedProject && onProjectAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onProjectAdmin}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Project Settings</span>
                </Button>
              )}
              
              <UserMenu onProfileClick={() => setShowProfileModal(true)} />
            </div>
          </div>
        </div>
      </nav>

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Navbar;
