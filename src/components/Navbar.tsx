
import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentView: string;
  onBackToDashboard: () => void;
  selectedProject?: any;
}

const Navbar = ({ currentView, onBackToDashboard, selectedProject }: NavbarProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            
            {currentView === 'kanban' && (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onBackToDashboard}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                {selectedProject && (
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedProject.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {selectedProject.description}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {currentView === 'dashboard' && (
              <h1 className="text-xl font-semibold text-gray-900">Kanbana</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button
              variant="outline"
              onClick={handleAdminClick}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
