
import React from 'react';
import { Plus, Search, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from './ProjectCard';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  taskCount?: number;
  completedTasks?: number;
}

interface ProjectsSectionProps {
  projects: Project[];
  projectsLoading: boolean;
  onCreateProject: () => void;
  onProjectSelect: (projectId: string) => void;
  onProjectAdmin: (project: Project, event: any) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  projectsLoading,
  onCreateProject,
  onProjectSelect,
  onProjectAdmin,
}) => {
  return (
    <>
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
            onClick={onCreateProject}
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
            onClick={onCreateProject}
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
                onSelect={() => onProjectSelect(project.id)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => onProjectAdmin(project, e)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectsSection;
