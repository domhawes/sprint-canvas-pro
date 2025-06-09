
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectStats = (projectId: string) => {
  return useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: async () => {
      // Get total task count
      const { count: totalTasks, error: totalError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (totalError) throw totalError;

      // Get completed tasks count (assuming 'Done' column represents completed tasks)
      const { data: doneColumn, error: columnError } = await supabase
        .from('board_columns')
        .select('id')
        .eq('project_id', projectId)
        .eq('title', 'Done')
        .maybeSingle();

      let completedTasks = 0;
      if (doneColumn && !columnError) {
        const { count: doneCount, error: doneError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('column_id', doneColumn.id);

        if (!doneError) {
          completedTasks = doneCount || 0;
        }
      }

      // Get member count
      const { count: memberCount, error: memberError } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (memberError) throw memberError;

      return {
        taskCount: totalTasks || 0,
        completedTasks,
        memberCount: memberCount || 0,
      };
    },
  });
};
