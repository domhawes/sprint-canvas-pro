
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import TaskCategoriesManager from './TaskCategoriesManager';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';

const KanbanBoard = ({ projectId }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const { columns, loading, moveTask, createTask, updateTask, refetch } = useKanbanBoard(projectId);

  console.log('KanbanBoard render state:', { 
    showTaskModal, 
    selectedTask, 
    selectedColumnId,
    columnsCount: columns?.length 
  });

  const handleTaskClick = (task) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setSelectedColumnId(null);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (taskData) => {
    console.log('Saving task:', taskData);
    try {
      if (updateTask && selectedTask) {
        // Use selectedTask.id for the update, not taskData.id
        await updateTask(selectedTask.id, taskData);
      }
      setShowTaskModal(false);
      setSelectedTask(null);
      setSelectedColumnId(null);
      await refetch();
    } catch (error) {
      console.error('Error saving task:', error);
    }
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
    console.log('Creating new task');
    setSelectedTask(null);
    setSelectedColumnId(null);
    setShowTaskModal(true);
  };

  const handleAddCard = (columnId) => {
    console.log('Adding card to column:', columnId);
    setSelectedTask(null);
    setSelectedColumnId(columnId);
    setShowTaskModal(true);
  };

  const handleCreateTaskInColumn = async (taskData) => {
    console.log('Creating task in column:', taskData);
    try {
      const taskWithColumn = {
        ...taskData,
        column_id: selectedColumnId || taskData.column_id
      };
      
      await createTask(taskWithColumn);
      setShowTaskModal(false);
      setSelectedTask(null);
      setSelectedColumnId(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setShowTaskModal(false);
    setSelectedTask(null);
    setSelectedColumnId(null);
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

  if (!columns || columns.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">No columns found. Please create columns first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Project Board</h2>
          <div className="flex gap-3">
            <TaskCategoriesManager projectId={projectId} />
            <Button 
              onClick={handleCreateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
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
            onAddCard={handleAddCard}
          />
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          columns={columns}
          preselectedColumnId={selectedColumnId}
          onSave={handleTaskSave}
          onClose={handleCloseModal}
          onCreate={selectedColumnId ? handleCreateTaskInColumn : createTask}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
