
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  project_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useTaskCategories = (projectId: string) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCategories = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.log('Error fetching categories:', error);
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: { name: string; color: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_categories')
        .insert({
          ...categoryData,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Category created",
        description: "New category has been created successfully.",
      });

      return data;
    } catch (error: any) {
      console.log('Error creating category:', error);
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Category updated",
        description: "Category has been updated successfully.",
      });

      return data;
    } catch (error: any) {
      console.log('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error: any) {
      console.log('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [projectId, user]);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};
