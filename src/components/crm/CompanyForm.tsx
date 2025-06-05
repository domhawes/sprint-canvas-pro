
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies } from '@/hooks/useCompanies';

interface CompanyFormProps {
  company?: any;
  onClose?: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose }) => {
  const { createCompany, updateCompany } = useCompanies();
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: company || {},
  });

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
  ];

  const onSubmit = (data: any) => {
    if (company) {
      updateCompany.mutate({ id: company.id, ...data });
    } else {
      createCompany.mutate(data);
    }
    onClose?.();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{company ? 'Edit Company' : 'Add New Company'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                {...register('industry')}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_range">Company Size</Label>
              <Select onValueChange={(value) => setValue('size_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headquarters_location">Headquarters</Label>
              <Input
                id="headquarters_location"
                {...register('headquarters_location')}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                id="founded_year"
                {...register('founded_year', { valueAsNumber: true })}
                placeholder="e.g., 2020"
                type="number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              {...register('logo_url')}
              placeholder="https://company.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the company"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createCompany.isPending || updateCompany.isPending}
            >
              {createCompany.isPending || updateCompany.isPending 
                ? 'Saving...' 
                : (company ? 'Update Company' : 'Create Company')
              }
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyForm;
