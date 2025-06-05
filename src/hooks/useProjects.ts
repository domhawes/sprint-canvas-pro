
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  taskCount?: number;
  completedTasks?: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(role),
          tasks(id, column_id)
        `);

      if (error) throw error;

      const projectsWithStats = data?.map(project => {
        const tasks = project.tasks || [];
        return {
          ...project,
          memberCount: 1, // Will be updated when we fetch actual member counts
          taskCount: tasks.length,
          completedTasks: 0, // Will be calculated properly when we have column data
        };
      }) || [];

      setProjects(projectsWithStats);
    } catch (error: any) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description: string; color: string }) => {
    if (!user) return;

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add the creator as the owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Create default columns
      const defaultColumns = [
        { title: 'To Do', color: 'bg-gray-100', position: 0 },
        { title: 'In Progress', color: 'bg-blue-100', position: 1 },
        { title: 'Review', color: 'bg-yellow-100', position: 2 },
        { title: 'Done', color: 'bg-green-100', position: 3 },
      ];

      const { error: columnsError } = await supabase
        .from('board_columns')
        .insert(
          defaultColumns.map(col => ({
            ...col,
            project_id: project.id,
          }))
        );

      if (columnsError) throw columnsError;

      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });

      fetchProjects();
      return project;
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    refetch: fetchProjects,
  };
};
