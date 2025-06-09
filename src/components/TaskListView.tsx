
import React from 'react';
import { Calendar, User, Flag, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assignee_id?: string;
  category?: {
    name: string;
    color: string;
  };
  created_at: string;
  column?: {
    title: string;
    color?: string;
  };
}

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onTaskClick }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                {task.category && (
                  <Badge 
                    variant="outline"
                    style={{ 
                      backgroundColor: task.category.color + '20', 
                      borderColor: task.category.color,
                      color: task.category.color 
                    }}
                  >
                    {task.category.name}
                  </Badge>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{task.assignee_id ? 'Assigned' : 'Unassigned'}</span>
                </div>
                
                {task.due_date && (
                  <div className={`flex items-center ${isOverdue(task.due_date) ? 'text-red-600' : ''}`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    {isOverdue(task.due_date) && (
                      <Clock className="w-4 h-4 ml-1 text-red-500" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center">
                  <span>Status: {task.column?.title || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskListView;
