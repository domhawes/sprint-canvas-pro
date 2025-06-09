
import React from 'react';
import { Users, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useProjectStats } from '@/hooks/useProjectStats';

const ProjectCard = ({ project, onSelect }) => {
  const { data: stats, isLoading } = useProjectStats(project.id);
  
  const progressPercentage = stats?.taskCount > 0 ? (stats.completedTasks / stats.taskCount) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${project.color} rounded-lg flex items-center justify-center mb-4`}>
          <span className="text-white font-bold text-lg">
            {project.name.charAt(0)}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {project.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {isLoading ? 'Loading...' : `${stats?.completedTasks || 0}/${stats?.taskCount || 0} tasks`}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-1" />
            {isLoading ? 'Loading...' : `${stats?.memberCount || 0} members`}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
