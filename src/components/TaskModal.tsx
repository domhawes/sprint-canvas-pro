
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTaskCategories } from '@/hooks/useTaskCategories';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('none');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const { categories } = useTaskCategories(projectId);
  
  const isEditing = !!task;

  // Initialize form data when task or columns change
  useEffect(() => {
    console.log('TaskModal effect running', { task, preselectedColumnId, columns });
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.column_id || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setCategoryId(task.category_id || 'none');
    } else {
      setTitle('');
      setDescription('');
      setColumnId(preselectedColumnId || (columns.length > 0 ? columns[0].id : ''));
      setPriority('medium');
      setDueDate(undefined);
      setCategoryId('none');
    }
  }, [task, preselectedColumnId, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TaskModal handleSubmit', { title, description, columnId, isEditing });
    
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
      category_id: categoryId === 'none' ? null : categoryId,
    };

    console.log('Submitting task data:', taskData);

    if (isEditing) {
      // For editing, pass the complete task object with updates
      onSave({ ...task, ...taskData });
    } else if (onCreate) {
      onCreate(taskData);
    }
  };

  console.log('TaskModal rendering', { columns, projectId, isEditing });

  const hasColumns = columns && columns.length > 0;

  return (
    <TaskModalDialog 
      isEditing={isEditing} 
      onClose={onClose} 
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
          dueDate={dueDate}
          setDueDate={setDueDate}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          columns={columns}
          categories={categories}
        />

        <TaskAttachmentsSection
          isEditing={isEditing}
          taskId={task?.id}
          showAttachments={showAttachments}
          setShowAttachments={setShowAttachments}
        />

        <TaskFormActions
          isEditing={isEditing}
          onClose={onClose}
        />
      </form>
    </TaskModalDialog>
  );
};

export default TaskModal;
