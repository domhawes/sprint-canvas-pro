
import { useMemo } from 'react';

export type SortOption = 'urgency' | 'deadline' | 'created' | 'title';
export type ViewMode = 'kanban' | 'list';

const priorityOrder = { high: 3, medium: 2, low: 1 };

export const useTaskSorting = (tasks: any[], sortBy: SortOption = 'urgency') => {
  return useMemo(() => {
    if (!tasks) return [];

    return [...tasks].sort((a, b) => {
      // Primary sort by urgency (priority + deadline)
      if (sortBy === 'urgency') {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // High priority first
        }
        
        // Secondary sort by deadline if priority is the same
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      }

      // Sort by deadline only
      if (sortBy === 'deadline') {
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      }

      // Sort by creation date
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      // Sort by title
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });
  }, [tasks, sortBy]);
};
