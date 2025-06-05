
import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const Navbar = ({ currentView, onBackToDashboard, selectedProject, onProjectAdmin }) => {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentView === 'kanban' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {currentView === 'kanban' && selectedProject ? selectedProject.name : 'Kanbana'}
              </h1>
              {currentView === 'kanban' && selectedProject && (
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentView === 'kanban' && selectedProject && onProjectAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onProjectAdmin}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4 mr-2" />
              Project Settings
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={signOut}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
