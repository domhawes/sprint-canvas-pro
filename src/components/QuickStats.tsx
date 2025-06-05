
import React from 'react';

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

interface QuickStatsProps {
  projects: Project[];
}

const QuickStats: React.FC<QuickStatsProps> = ({ projects }) => {
  const totalProjects = projects.length;
  const activeTasks = projects.reduce((sum, p) => sum + ((p.taskCount || 0) - (p.completedTasks || 0)), 0);
  const completedTasks = projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
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
            <p className="text-3xl font-bold text-gray-900">{activeTasks}</p>
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
            <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
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
  );
};

export default QuickStats;
