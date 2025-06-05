
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  project_id: string;
  assignee_id: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  position: number;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  assignee?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Column {
  id: string;
  title: string;
  color: string | null;
  position: number;
  project_id: string;
  tasks: Task[];
}

export const useKanbanBoard = (projectId: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBoardData = async () => {
    if (!user || !projectId) return;

    try {
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('board_columns')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (columnsError) throw columnsError;

      // Fetch tasks with assignee info
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles(full_name, email)
        `)
        .eq('project_id', projectId)
        .order('position');

      if (tasksError) throw tasksError;

      // Group tasks by column and ensure type safety
      const columnsWithTasks: Column[] = columnsData?.map(column => ({
        ...column,
        tasks: (tasksData || [])
          .filter(task => task.column_id === column.id)
          .map(task => ({
            ...task,
            assignee: Array.isArray(task.assignee) ? task.assignee[0] : task.assignee
          })) || [],
      })) || [];

      setColumns(columnsWithTasks);
    } catch (error: any) {
      console.log('Error fetching board data:', error);
      toast({
        title: "Error fetching board data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, newColumnId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ column_id: newColumnId })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setColumns(prevColumns => {
        const newColumns = prevColumns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }));

        const sourceTask = prevColumns
          .flatMap(col => col.tasks)
          .find(task => task.id === taskId);

        if (sourceTask) {
          const targetColumnIndex = newColumns.findIndex(col => col.id === newColumnId);
          if (targetColumnIndex !== -1) {
            newColumns[targetColumnIndex].tasks.push({
              ...sourceTask,
              column_id: newColumnId
            });
          }
        }

        return newColumns;
      });

      toast({
        title: "Task moved",
        description: "Task has been moved successfully.",
      });
    } catch (error: any) {
      console.log('Error moving task:', error);
      toast({
        title: "Error moving task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    column_id: string;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Task created",
        description: "New task has been created successfully.",
      });

      fetchBoardData();
      return data;
    } catch (error: any) {
      console.log('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId, user]);

  return {
    columns,
    loading,
    moveTask,
    createTask,
    refetch: fetchBoardData,
  };
};
