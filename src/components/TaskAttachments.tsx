
import React, { useRef } from 'react';
import { Paperclip, Download, Trash2, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTaskAttachments } from '@/hooks/useTaskAttachments';

interface TaskAttachmentsProps {
  taskId: string;
  isEditing?: boolean;
}

const TaskAttachments = ({ taskId, isEditing = false }: TaskAttachmentsProps) => {
  const { attachments, uploading, uploadAttachment, deleteAttachment, getFileUrl } = useTaskAttachments(taskId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadAttachment(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    return '📎';
  };

  return (
    <div className="space-y-3">
      {isEditing && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Add Attachment'}
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Paperclip className="w-4 h-4" />
            Attachments ({attachments.length})
          </div>
          
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(attachment.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{attachment.file_name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(getFileUrl(attachment.file_path), '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAttachment(attachment)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
