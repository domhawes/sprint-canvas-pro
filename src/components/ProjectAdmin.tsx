
import React, { useState } from 'react';
import { Settings, Users, Trash2, Edit, UserPlus, Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProjectAttachments from './ProjectAttachments';

const ProjectAdmin = ({ project, onClose, onProjectUpdated }) => {
  const [projectName, setProjectName] = useState(project?.name || '');
  const [projectDescription, setProjectDescription] = useState(project?.description || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateProject = async () => {
    if (!project) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectName,
          description: projectDescription,
        })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Project details have been updated successfully.",
      });

      onProjectUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      // Delete tasks first
      await supabase.from('tasks').delete().eq('project_id', project.id);
      
      // Delete board columns
      await supabase.from('board_columns').delete().eq('project_id', project.id);
      
      // Delete project members
      await supabase.from('project_members').delete().eq('project_id', project.id);
      
      // Finally delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });

      onClose();
      onProjectUpdated();
    } catch (error: any) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Project Administration</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Project Details</span>
              </CardTitle>
              <CardDescription>
                Update your project information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                />
              </div>
              <Button 
                onClick={handleUpdateProject} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </CardContent>
          </Card>

          {/* Project Attachments */}
          <ProjectAttachments projectId={project.id} />

          {/* Project Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Members</span>
              </CardTitle>
              <CardDescription>
                Manage project team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">You (Owner)</p>
                  <p className="text-sm text-gray-600">Project creator and administrator</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Member invitation feature coming soon
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Deleting...' : 'Delete Project'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectAdmin;
