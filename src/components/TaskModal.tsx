
import React, { useState, useEffect, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { categories } = useTaskCategories(projectId);
  const { members } = useProjectMembers(projectId);
  
  const isEditing = !!task;
  const storageKey = `task-form-${projectId}-${task?.id || 'new'}`;
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced save function to prevent excessive localStorage writes
  const debouncedSave = (data: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (!isEditing && isInitialized) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
          console.log('Form data saved to localStorage:', data);
        } catch (error) {
          console.error('Error saving form data:', error);
        }
      }
    }, 500);
  };

  // Load form data from localStorage
  const loadFormData = () => {
    if (!isEditing) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          console.log('Loaded form data from localStorage:', parsedData);
          return parsedData;
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
    return null;
  };

  // Clear form data from localStorage
  const clearFormData = () => {
    try {
      localStorage.removeItem(storageKey);
      console.log('Cleared form data from localStorage');
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  };

  // Initialize form data when task or columns change
  useEffect(() => {
    console.log('TaskModal initializing', { task, preselectedColumnId, columns });
    
    if (task) {
      // Editing existing task - use task data
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.column_id || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setCategoryId(task.category_id || 'none');
      setAssigneeId(task.assignee_id || 'none');
      setIsInitialized(true);
    } else {
      // Creating new task - try to load from localStorage first
      const savedData = loadFormData();
      if (savedData) {
        console.log('Restoring saved form data');
        setTitle(savedData.title || '');
        setDescription(savedData.description || '');
        setColumnId(savedData.columnId || preselectedColumnId || (columns.length > 0 ? columns[0].id : ''));
        setPriority(savedData.priority || 'medium');
        setDueDate(savedData.dueDate ? new Date(savedData.dueDate) : undefined);
        setCategoryId(savedData.categoryId || 'none');
        setAssigneeId(savedData.assigneeId || 'none');
      } else {
        // Default values for new task
        console.log('Using default values for new task');
        setTitle('');
        setDescription('');
        setColumnId(preselectedColumnId || (columns.length > 0 ? columns[0].id : ''));
        setPriority('medium');
        setDueDate(undefined);
        setCategoryId('none');
        setAssigneeId('none');
      }
      setIsInitialized(true);
    }
  }, [task, preselectedColumnId, columns]);

  // Save form data whenever any field changes (for new tasks only)
  useEffect(() => {
    if (!isEditing && isInitialized) {
      const formData = {
        title,
        description,
        columnId,
        priority,
        dueDate: dueDate?.toISOString(),
        categoryId,
        assigneeId,
        timestamp: Date.now()
      };
      debouncedSave(formData);
    }
  }, [title, description, columnId, priority, dueDate, categoryId, assigneeId, isEditing, isInitialized]);

  // Add page visibility API to save data when user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isEditing && isInitialized) {
        // Immediately save when tab becomes hidden
        const formData = {
          title,
          description,
          columnId,
          priority,
          dueDate: dueDate?.toISOString(),
          categoryId,
          assigneeId,
          timestamp: Date.now()
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(formData));
          console.log('Form data saved on tab switch:', formData);
        } catch (error) {
          console.error('Error saving on tab switch:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [title, description, columnId, priority, dueDate, categoryId, assigneeId, isEditing, isInitialized, storageKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
