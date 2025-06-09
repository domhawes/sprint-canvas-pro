
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

// Temporarily return a hardcoded logo until the site_images table types are available
export const useSiteImages = () => {
  return useQuery({
    queryKey: ['site-images'],
    queryFn: async () => {
      // Hardcoded data until the table types are available
      return [] as SiteImage[];
    },
  });
};

export const useSiteImage = (name: string) => {
  return useQuery({
    queryKey: ['site-image', name],
    queryFn: async () => {
      // Return hardcoded logo for now
      if (name === 'kanbana-logo') {
        return {
          id: '1',
          name: 'kanbana-logo',
          file_name: 'kanbana-logo.png',
          file_path: '/lovable-uploads/1ae6e39e-b18f-4f6f-8fcc-b6c12da96833.png',
          file_type: 'image/png',
          file_size: 0,
          alt_text: 'Kanbana Logo',
          uploaded_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SiteImage;
      }
      return null;
    },
  });
};

export const useUploadSiteImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, name, altText }: { file: File; name: string; altText?: string }) => {
      // Placeholder implementation until the table types are available
      const fileExt = file.name.split('.').pop();
      const fileName = `${name}.${fileExt}`;
      
      toast({
        title: "Feature unavailable",
        description: "Image upload will be available once the database types are updated.",
        variant: "destructive",
      });
      
      throw new Error("Image upload temporarily unavailable");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
    onError: (error: any) => {
      console.log("Upload error:", error.message);
    },
  });
};
