
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Paperclip } from 'lucide-react';
import TaskAttachments from './TaskAttachments';

interface TaskAttachmentsSectionProps {
  isEditing: boolean;
  taskId?: string;
  showAttachments: boolean;
  setShowAttachments: (show: boolean) => void;
}

const TaskAttachmentsSection = ({
  isEditing,
  taskId,
  showAttachments,
  setShowAttachments
}: TaskAttachmentsSectionProps) => {
  if (!isEditing) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Attachments</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAttachments(!showAttachments)}
        >
          <Paperclip className="w-4 h-4 mr-2" />
          {showAttachments ? 'Hide' : 'Show'} Attachments
        </Button>
      </div>
      {showAttachments && taskId && <TaskAttachments taskId={taskId} />}
    </div>
  );
};

export default TaskAttachmentsSection;
