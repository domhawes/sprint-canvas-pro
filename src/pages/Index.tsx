
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectAdmin from '../components/ProjectAdmin';
import WelcomeHeader from '../components/WelcomeHeader';
import QuickStats from '../components/QuickStats';
import ProjectsSection from '../components/ProjectsSection';
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
          <WelcomeHeader 
            userName={user.user_metadata?.full_name || user.email}
          />

          <QuickStats projects={projects} />

          <ProjectsSection
            projects={projects}
            projectsLoading={projectsLoading}
            onCreateProject={() => setShowCreateModal(true)}
            onProjectSelect={handleProjectSelect}
            onProjectAdmin={handleProjectAdmin}
          />
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
