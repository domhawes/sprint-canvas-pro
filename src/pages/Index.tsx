import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KanbanBoard from '../components/KanbanBoard';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectAdmin from '../components/ProjectAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminProject, setAdminProject] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, refetch } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('kanban');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProjectId(null);
  };

  const handleCreateProject = async (projectData: { name: string; description: string; color: string }) => {
    const project = await createProject(projectData);
    if (project) {
      setShowCreateModal(false);
    }
  };

  const handleProjectAdmin = (project, event) => {
    event.stopPropagation();
    setAdminProject(project);
    setShowAdminModal(true);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        currentView={currentView} 
        onBackToDashboard={handleBackToDashboard}
        selectedProject={selectedProject}
        onProjectAdmin={selectedProject ? () => handleProjectAdmin(selectedProject, { stopPropagation: () => {} }) : undefined}
      />
      
      {currentView === 'dashboard' && (
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user.user_metadata?.full_name || user.email}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Manage your projects and stay productive
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + ((p.taskCount || 0) - (p.completedTasks || 0)), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900">1</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 w-64"
                />
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {projectsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="relative group">
                  <ProjectCard
                    project={project}
                    onSelect={() => handleProjectSelect(project.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleProjectAdmin(project, e)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'kanban' && selectedProjectId && (
        <KanbanBoard projectId={selectedProjectId} />
      )}

      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />

      {showAdminModal && (
        <ProjectAdmin
          project={adminProject}
          onClose={() => setShowAdminModal(false)}
          onProjectUpdated={refetch}
        />
      )}
    </div>
  );
};

export default Index;
