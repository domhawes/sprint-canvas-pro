
import React, { useState } from 'react';
import { UserPlus, Mail, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProjectMembers } from '@/hooks/useProjectMembers';

interface ProjectMemberInviteProps {
  projectId: string;
}

const ProjectMemberInvite: React.FC<ProjectMemberInviteProps> = ({ projectId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { members, loading: membersLoading, refetch } = useProjectMembers(projectId);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to invite.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists in the system
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingProfile) {
        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', existingProfile.id)
          .maybeSingle();

        if (existingMember) {
          toast({
            title: "User already a member",
            description: "This user is already a member of this project.",
            variant: "destructive",
          });
          return;
        }

        // Add existing user to project
        const { error } = await supabase
          .from('project_members')
          .insert({
            project_id: projectId,
            user_id: existingProfile.id,
            role: role,
          });

        if (error) throw error;

        toast({
          title: "Member added",
          description: `${email} has been added to the project.`,
        });
      } else {
        // For now, we'll just show a message that the user needs to sign up first
        toast({
          title: "User not found",
          description: "This user needs to create an account first before being invited.",
          variant: "destructive",
        });
        return;
      }

      setEmail('');
      setRole('viewer');
      refetch();
    } catch (error: any) {
      toast({
        title: "Invitation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail?: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail || 'this member'} from the project?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from the project.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Team Members</span>
        </CardTitle>
        <CardDescription>
          Invite team members to collaborate on this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Form */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={role} onValueChange={(value: 'viewer' | 'editor') => setRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Users must have an account to be added to projects.
          </p>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Current Members</h4>
          {membersLoading ? (
            <p className="text-sm text-gray-500">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500">No members found.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.profile?.full_name?.charAt(0) || member.profile?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                        {member.role === 'owner' && <span className="text-sm text-gray-500 ml-2">(Owner)</span>}
                      </p>
                      {member.profile?.email && member.profile?.full_name && (
                        <p className="text-sm text-gray-600">{member.profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user_id, member.profile?.email)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMemberInvite;
