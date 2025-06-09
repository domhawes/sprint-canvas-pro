
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SiteImage {
  id: string;
  name: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const useSiteImages = () => {
  return useQuery({
    queryKey: ['site-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as SiteImage[];
    },
  });
};

export const useSiteImage = (name: string) => {
  return useQuery({
    queryKey: ['site-image', name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .eq('name', name)
        .maybeSingle();

      if (error) throw error;
      return data as SiteImage | null;
    },
  });
};

export const useUploadSiteImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, name, altText }: { file: File; name: string; altText?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${name}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      // Save image record
      const { data, error } = await supabase
        .from('site_images')
        .insert({
          name,
          file_name: fileName,
          file_path: publicUrl,
          file_type: file.type,
          file_size: file.size,
          alt_text: altText || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
      toast({
        title: "Image uploaded",
        description: "Site image has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
