
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';

const KanbanBoard = ({ projectId }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const { columns, loading, moveTask, createTask } = useKanbanBoard(projectId);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData) => {
    // This would update the task in the database
    console.log('Saving task:', taskData);
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = (columnId) => {
    if (!draggedTask) return;
    
    if (draggedTask.column_id !== columnId) {
      moveTask(draggedTask.id, columnId);
    }
    
    setDraggedTask(null);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Project Board</h2>
          <Button 
            onClick={handleCreateTask}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
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
          columns={columns}
          onSave={handleTaskSave}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onCreate={createTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
