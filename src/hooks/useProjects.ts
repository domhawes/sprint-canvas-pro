
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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching projects for user:', user.id);
      
      // Simplified query: get projects where user is a member
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(user_id)
        `)
        .eq('project_members.user_id', user.id);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      console.log('Projects data:', projectsData);

      // Simple project mapping without complex stats for now
      const projectsWithStats = projectsData?.map(project => ({
        ...project,
        memberCount: 1,
        taskCount: 0,
        completedTasks: 0,
      })) || [];

      console.log('Projects with stats:', projectsWithStats);
      setProjects(projectsWithStats);
    } catch (error: any) {
      console.error('Error in fetchProjects:', error);
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
      console.log('Creating project:', projectData);
      console.log('Current user:', user);
      
      // First, ensure the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking user profile:', profileError);
        throw profileError;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Creating user profile...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
          });

        if (createProfileError) {
          console.error('Error creating user profile:', createProfileError);
          throw createProfileError;
        }
        console.log('User profile created');
      }
      
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }

      console.log('Project created:', project);

      // Add the creator as the owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Error adding project member:', memberError);
        throw memberError;
      }

      console.log('Project member added');

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

      if (columnsError) {
        console.error('Error creating columns:', columnsError);
        throw columnsError;
      }

      console.log('Default columns created');

      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });

      fetchProjects();
      return project;
    } catch (error: any) {
      console.error('Error in createProject:', error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Only fetch projects if user is defined (either authenticated or null)
    if (user !== undefined) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    refetch: fetchProjects,
  };
};
