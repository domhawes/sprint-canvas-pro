
import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TaskCard from './TaskCard';

const KanbanColumn = ({ column, onTaskClick, onDragStart, onDrop, onAddCard }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(column.id);
  };

  const handleAddCard = () => {
    onAddCard(column.id);
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div 
        className="bg-gray-50 rounded-lg p-4 h-full"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-')}`}></div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDragStart={() => onDragStart(task)}
            />
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-300 hover:border-gray-400"
          onClick={handleAddCard}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a card
        </Button>
      </div>
    </div>
  );
};

export default KanbanColumn;
