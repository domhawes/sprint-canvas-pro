
import { useState, useEffect, useRef } from 'react';

interface FormData {
  title: string;
  description: string;
  columnId: string;
  priority: string;
  dueDate: Date | undefined;
  categoryId: string;
  assigneeId: string;
}

interface UseTaskFormPersistenceProps {
  task?: any;
  preselectedColumnId?: string;
  columns: any[];
  projectId: string;
  isEditing: boolean;
}

export const useTaskFormPersistence = ({
  task,
  preselectedColumnId,
  columns,
  projectId,
  isEditing
}: UseTaskFormPersistenceProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('none');
  const [assigneeId, setAssigneeId] = useState('none');
  const [isInitialized, setIsInitialized] = useState(false);
  
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

  return {
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
  };
};
