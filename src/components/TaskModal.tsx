
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTaskCategories } from '@/hooks/useTaskCategories';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useTaskFormPersistence } from '@/hooks/useTaskFormPersistence';
import TaskModalDialog from './TaskModalDialog';
import TaskFormFields from './TaskFormFields';
import TaskFormActions from './TaskFormActions';
import TaskAttachmentsSection from './TaskAttachmentsSection';

interface TaskModalProps {
  task?: any;
  columns: any[];
  preselectedColumnId?: string;
  onSave: (taskData: any) => void;
  onClose: () => void;
  onCreate?: (taskData: any) => void;
  projectId: string;
}

const TaskModal = ({ 
  task, 
  columns, 
  preselectedColumnId, 
  onSave, 
  onClose, 
  onCreate,
  projectId 
}: TaskModalProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const { categories } = useTaskCategories(projectId);
  const { members } = useProjectMembers(projectId);
  
  const isEditing = !!task;

  const {
    title,
    setTitle,
    description,
    setDescription,
    columnId,
    setColumnId,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    categoryId,
    setCategoryId,
    assigneeId,
    setAssigneeId,
    isInitialized,
    clearFormData
  } = useTaskFormPersistence({
    task,
    preselectedColumnId,
    columns,
    projectId,
    isEditing
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TaskModal handleSubmit', { title, description, columnId, categoryId, assigneeId, isEditing });
    
    if (!title.trim()) {
      console.log('No title provided');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      column_id: columnId,
      priority,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      category_id: categoryId === 'none' || !categoryId || categoryId.trim() === '' ? null : categoryId,
      assignee_id: assigneeId === 'none' || !assigneeId || assigneeId.trim() === '' ? null : assigneeId,
    };

    console.log('Submitting task data:', taskData);

    if (isEditing) {
      onSave(taskData);
    } else if (onCreate) {
      onCreate(taskData);
      // Clear saved form data after successful creation
      clearFormData();
    }
  };

  const handleClose = () => {
    // Clear saved form data when closing without saving (for new tasks)
    if (!isEditing) {
      clearFormData();
    }
    onClose();
  };

  console.log('TaskModal rendering', { columns, projectId, isEditing, categoryId, assigneeId, isInitialized });

  const hasColumns = columns && columns.length > 0;

  return (
    <TaskModalDialog 
      isEditing={isEditing} 
      onClose={handleClose} 
      hasColumns={hasColumns}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TaskFormFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          columnId={columnId}
          setColumnId={setColumnId}
          priority={priority}
          setPriority={setPriority}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          assigneeId={assigneeId}
          setAssigneeId={setAssigneeId}
          dueDate={dueDate}
          setDueDate={setDueDate}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          columns={columns}
          categories={categories}
          members={members}
        />

        <TaskAttachmentsSection
          isEditing={isEditing}
          taskId={task?.id}
          showAttachments={showAttachments}
          setShowAttachments={setShowAttachments}
        />

        <TaskFormActions
          isEditing={isEditing}
          onClose={handleClose}
        />
      </form>
    </TaskModalDialog>
  );
};

export default TaskModal;
