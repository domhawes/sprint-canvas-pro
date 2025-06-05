
import React from 'react';
import { Calendar, User, Flag } from 'lucide-react';

const TaskCard = ({ task, onClick, onDragStart }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          <Flag className="w-3 h-3 mr-1" />
          {task.priority}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          <span className="truncate">
            {task.assignee?.full_name || task.assignee?.email || 'Unassigned'}
          </span>
        </div>
        {task.due_date && (
          <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
