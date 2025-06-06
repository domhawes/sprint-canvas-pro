
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, X } from 'lucide-react';

interface TaskFormActionsProps {
  isEditing: boolean;
  onClose: () => void;
}

const TaskFormActions = ({ isEditing, onClose }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onClose}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button type="submit">
        <Save className="w-4 h-4 mr-2" />
        {isEditing ? 'Save Changes' : 'Create Task'}
      </Button>
    </div>
  );
};

export default TaskFormActions;
