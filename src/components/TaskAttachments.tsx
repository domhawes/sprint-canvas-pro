
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, File, Image, FileText } from 'lucide-react';
import { useTaskAttachments } from '@/hooks/useTaskAttachments';

interface TaskAttachmentsProps {
  taskId: string;
}

const TaskAttachments = ({ taskId }: TaskAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    attachments, 
    loading, 
    uploading, 
    uploadAttachment, 
    deleteAttachment, 
    getFileUrl 
  } = useTaskAttachments(taskId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAttachment(file);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (attachment: any) => {
    const url = getFileUrl(attachment.file_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Attachments</h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.svg"
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-gray-600">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteAttachment(attachment)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
