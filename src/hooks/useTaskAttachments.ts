
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

export const useTaskAttachments = (taskId: string) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAttachments = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error: any) {
      console.log('Error fetching attachments:', error);
      toast({
        title: "Error fetching attachments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!user || !taskId) return;

    try {
      setUploading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${taskId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save attachment record to database
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAttachments(prev => [data, ...prev]);
      toast({
        title: "File uploaded",
        description: "File has been uploaded successfully.",
      });

      return data;
    } catch (error: any) {
      console.log('Error uploading attachment:', error);
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachment: TaskAttachment) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      setAttachments(prev => prev.filter(att => att.id !== attachment.id));
      toast({
        title: "File deleted",
        description: "File has been deleted successfully.",
      });
    } catch (error: any) {
      console.log('Error deleting attachment:', error);
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  return {
    attachments,
    loading,
    uploading,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    refetch: fetchAttachments,
  };
};
