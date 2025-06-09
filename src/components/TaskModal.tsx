
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTaskCategories } from '@/hooks/useTaskCategories';
import { useProjectMembers } from '@/hooks/useProjectMembers';
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
  const [assigneeId, setAssigneeId] = useState('none');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const { categories } = useTaskCategories(projectId);
  const { members } = useProjectMembers(projectId);
  
  const isEditing = !!task;
  const storageKey = `task-form-${projectId}-${task?.id || 'new'}`;

  // Save form data to localStorage whenever any field changes
  const saveFormData = (data: any) => {
    if (!isEditing) { // Only persist for new tasks
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  // Load form data from localStorage
  const loadFormData = () => {
    if (!isEditing) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.log('Error parsing saved form data:', e);
        }
      }
    }
    return null;
  };

  // Clear form data from localStorage
  const clearFormData = () => {
    localStorage.removeItem(storageKey);
  };

  // Initialize form data when task or columns change
  useEffect(() => {
    console.log('TaskModal effect running', { task, preselectedColumnId, columns });
    
    if (task) {
      // Editing existing task - use task data
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.column_id || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setCategoryId(task.category_id && task.category_id.trim() !== '' ? task.category_id : 'none');
      setAssigneeId(task.assignee_id && task.assignee_id.trim() !== '' ? task.assignee_id : 'none');
    } else {
      // Creating new task - try to load from localStorage first
      const savedData = loadFormData();
      if (savedData) {
        setTitle(savedData.title || '');
        setDescription(savedData.description || '');
        setColumnId(savedData.columnId || preselectedColumnId || (columns.length > 0 ? columns[0].id : ''));
        setPriority(savedData.priority || 'medium');
        setDueDate(savedData.dueDate ? new Date(savedData.dueDate) : undefined);
        setCategoryId(savedData.categoryId || 'none');
        setAssigneeId(savedData.assigneeId || 'none');
      } else {
        // Default values for new task
        setTitle('');
        setDescription('');
        setColumnId(preselectedColumnId || (columns.length > 0 ? columns[0].id : ''));
        setPriority('medium');
        setDueDate(undefined);
        setCategoryId('none');
        setAssigneeId('none');
      }
    }
  }, [task, preselectedColumnId, columns]);

  // Save form data whenever any field changes (for new tasks only)
  useEffect(() => {
    if (!isEditing) {
      const formData = {
        title,
        description,
        columnId,
        priority,
        dueDate: dueDate?.toISOString(),
        categoryId,
        assigneeId
      };
      saveFormData(formData);
    }
  }, [title, description, columnId, priority, dueDate, categoryId, assigneeId, isEditing]);

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
      // Ensure we send null for 'none' values, not empty strings
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

  console.log('TaskModal rendering', { columns, projectId, isEditing, categoryId, assigneeId });

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
