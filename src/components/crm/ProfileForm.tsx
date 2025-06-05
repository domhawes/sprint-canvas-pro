
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfiles } from '@/hooks/useProfiles';
import { useCompanies } from '@/hooks/useCompanies';
import { Linkedin } from 'lucide-react';

const ProfileForm = () => {
  const { profile, updateProfile } = useProfiles();
  const { companies } = useCompanies();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: profile || {},
  });

  React.useEffect(() => {
    if (profile) {
      Object.keys(profile).forEach((key) => {
        setValue(key as any, profile[key]);
      });
    }
  }, [profile, setValue]);

  const onSubmit = (data: any) => {
    updateProfile.mutate(data);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Profile Information
          <Button variant="outline" size="sm" className="ml-auto">
            <Linkedin className="w-4 h-4 mr-2" />
            Import from LinkedIn
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register('email')}
                placeholder="Enter your email"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                {...register('job_title')}
                placeholder="Enter your job title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Enter your department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                {...register('years_experience', { valueAsNumber: true })}
                placeholder="Enter years of experience"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                {...register('linkedin_url')}
                placeholder="Enter your LinkedIn profile URL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Company</Label>
            <Select onValueChange={(value) => setValue('company_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Textarea
              id="skills"
              {...register('skills')}
              placeholder="e.g., JavaScript, React, Node.js, Project Management"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
