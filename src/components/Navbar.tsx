
import React from 'react';
import { ArrowLeft, Settings, User, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ currentView, onBackToDashboard, selectedProject, onProjectAdmin }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Navbar: Starting sign out...');
      await signOut();
      
      // Force navigation to auth page
      setTimeout(() => {
        navigate('/auth', { replace: true });
        window.location.reload(); // Force a complete reload to clear any cached state
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user has admin role (simplified check)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('admin');

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">K</span>
          </div>
          
          {currentView === 'kanban' && selectedProject ? (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToDashboard}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h1>
              {onProjectAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onProjectAdmin}
                  className="flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              )}
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-gray-900">Kanbana</h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/crm')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              CRM & Analytics
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user?.user_metadata?.full_name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/crm')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile & Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
