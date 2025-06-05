
import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

const KanbanBoard = ({ projectId }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Sample board data
  const [boardData, setBoardData] = useState({
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        color: 'bg-gray-100',
        tasks: [
          {
            id: 1,
            title: 'Design landing page mockups',
            description: 'Create high-fidelity mockups for the new landing page design',
            assignee: 'Sarah Johnson',
            dueDate: '2024-06-15',
            priority: 'High',
            tags: ['Design', 'UI/UX']
          },
          {
            id: 2,
            title: 'Set up project repository',
            description: 'Initialize Git repository and set up development environment',
            assignee: 'Mike Chen',
            dueDate: '2024-06-10',
            priority: 'Medium',
            tags: ['Development', 'Setup']
          }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        color: 'bg-blue-100',
        tasks: [
          {
            id: 3,
            title: 'Implement user authentication',
            description: 'Build secure login and registration system with JWT tokens',
            assignee: 'Alex Rodriguez',
            dueDate: '2024-06-20',
            priority: 'High',
            tags: ['Development', 'Backend']
          },
          {
            id: 4,
            title: 'Content strategy planning',
            description: 'Develop content calendar and marketing strategy',
            assignee: 'Emma Davis',
            dueDate: '2024-06-18',
            priority: 'Medium',
            tags: ['Marketing', 'Content']
          }
        ]
      },
      {
        id: 'review',
        title: 'Review',
        color: 'bg-yellow-100',
        tasks: [
          {
            id: 5,
            title: 'Database schema design',
            description: 'Review and finalize database structure for the application',
            assignee: 'John Smith',
            dueDate: '2024-06-12',
            priority: 'High',
            tags: ['Database', 'Backend']
          }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        color: 'bg-green-100',
        tasks: [
          {
            id: 6,
            title: 'Project kickoff meeting',
            description: 'Completed initial project planning and team alignment',
            assignee: 'Team Lead',
            dueDate: '2024-06-05',
            priority: 'Medium',
            tags: ['Planning', 'Meeting']
          },
          {
            id: 7,
            title: 'Requirements gathering',
            description: 'Collected and documented all project requirements',
            assignee: 'Business Analyst',
            dueDate: '2024-06-08',
            priority: 'High',
            tags: ['Analysis', 'Documentation']
          }
        ]
      }
    ]
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData) => {
    setBoardData(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === taskData.id ? taskData : task
        )
      }))
    }));
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = (columnId) => {
    if (!draggedTask) return;

    setBoardData(prev => {
      const newColumns = prev.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== draggedTask.id)
      }));

      const targetColumn = newColumns.find(col => col.id === columnId);
      if (targetColumn) {
        targetColumn.tasks.push(draggedTask);
      }

      return { columns: newColumns };
    });

    setDraggedTask(null);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Project Board</h2>
          <Button 
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {boardData.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onTaskClick={handleTaskClick}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onSave={handleTaskSave}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
