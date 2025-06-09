
import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfiles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    bio: '',
    location: '',
    linkedin_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        job_title: profile.job_title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.email || '',
      }));
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and professional information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <Input
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
