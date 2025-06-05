
import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KanbanBoard from '../components/KanbanBoard';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Sample projects data
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website with modern design",
      color: "bg-blue-500",
      memberCount: 4,
      taskCount: 12,
      completedTasks: 7,
      dueDate: "2024-07-15"
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Native iOS and Android app for customer engagement",
      color: "bg-purple-500",
      memberCount: 6,
      taskCount: 24,
      completedTasks: 9,
      dueDate: "2024-08-30"
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q3 digital marketing campaign across all channels",
      color: "bg-green-500",
      memberCount: 3,
      taskCount: 8,
      completedTasks: 5,
      dueDate: "2024-06-20"
    }
  ];

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('kanban');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        currentView={currentView} 
        onBackToDashboard={handleBackToDashboard}
        selectedProject={projects.find(p => p.id === selectedProjectId)}
      />
      
      {currentView === 'dashboard' && (
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
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
                    {projects.reduce((sum, p) => sum + (p.taskCount - p.completedTasks), 0)}
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
                    {projects.reduce((sum, p) => sum + p.completedTasks, 0)}
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
                  <p className="text-3xl font-bold text-gray-900">12</p>
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={() => handleProjectSelect(project.id)}
              />
            ))}
          </div>
        </div>
      )}

      {currentView === 'kanban' && selectedProjectId && (
        <KanbanBoard projectId={selectedProjectId} />
      )}
    </div>
  );
};

export default Index;
