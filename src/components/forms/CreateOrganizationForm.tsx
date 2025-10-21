
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, OrganizationCreateData } from '@/api/organization.api';

interface CreateOrganizationFormProps {
  onSuccess?: (organization: any) => void;
  onCancel?: () => void;
  instituteId?: string;
  instituteName?: string;
}

const CreateOrganizationForm = ({ onSuccess, onCancel, instituteId, instituteName }: CreateOrganizationFormProps) => {
  const [formData, setFormData] = useState<OrganizationCreateData>({
    name: '',
    type: 'INSTITUTE',
    isPublic: true,
    enrollmentKey: '',
    needEnrollmentVerification: true,
    enabledEnrollments: true,
    imageUrl: '',
    instituteId: instituteId || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate enrollment key for INSTITUTE organizations
    if (formData.type === 'INSTITUTE' && !formData.enrollmentKey?.trim()) {
      toast({
        title: "Validation Error",
        description: "Enrollment key is required for institute organizations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const organization = await organizationApi.createOrganization(formData);
      
      toast({
        title: "Success",
        description: `Organization "${organization.name}" created successfully`,
      });
      
      if (onSuccess) {
        onSuccess(organization);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      
      // Provide specific error messages
      let errorMessage = "Failed to create organization";
      
      if (error instanceof Error) {
        if (error.message.includes("Only Organization Managers, Super Admins, or Institute Admins")) {
          errorMessage = "You don't have permission to create organizations. Please contact your administrator.";
        } else if (error.message.includes("Forbidden")) {
          errorMessage = "Access denied. You need Institute Admin permissions to create organizations.";
        } else if (error.message.includes("already exists")) {
          errorMessage = "An organization with this name already exists.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Cannot Create Organization",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationCreateData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Organization Details</CardTitle>
              <CardDescription className="text-sm">
                Fill in the information below to create your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Organization Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Organization Type *
              </Label>
              <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTITUTE">Institute</SelectItem>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {instituteId ? (
              <div className="space-y-2">
                <Label htmlFor="instituteId" className="text-sm font-medium">
                  Institute
                </Label>
                <Input
                  id="instituteId"
                  value={instituteName || instituteId}
                  disabled
                  className="bg-muted/50 cursor-not-allowed h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Organization will be created for this institute
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="instituteId" className="text-sm font-medium">
                  Institute ID (Optional for GLOBAL type)
                </Label>
                <Input
                  id="instituteId"
                  placeholder="Enter institute ID (optional)"
                  value={formData.instituteId}
                  onChange={(e) => handleInputChange('instituteId', e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL (Optional)
              </Label>
              <Input
                id="imageUrl"
                placeholder="Enter organization image URL"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentKey" className="text-sm font-medium">
                Enrollment Key {formData.type === 'INSTITUTE' ? '*' : '(Optional)'}
              </Label>
              <Input
                id="enrollmentKey"
                placeholder={formData.type === 'INSTITUTE' 
                  ? "Enter enrollment key..." 
                  : "Enter enrollment key (optional)"
                }
                value={formData.enrollmentKey}
                onChange={(e) => handleInputChange('enrollmentKey', e.target.value)}
                required={formData.type === 'INSTITUTE'}
                className="h-10"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                  Public Organization
                </Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="needEnrollmentVerification" className="text-sm font-medium cursor-pointer">
                  Require Enrollment Verification
                </Label>
                <Switch
                  id="needEnrollmentVerification"
                  checked={formData.needEnrollmentVerification}
                  onCheckedChange={(checked) => handleInputChange('needEnrollmentVerification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enabledEnrollments" className="text-sm font-medium cursor-pointer">
                  Enable Enrollments
                </Label>
                <Switch
                  id="enabledEnrollments"
                  checked={formData.enabledEnrollments}
                  onCheckedChange={(checked) => handleInputChange('enabledEnrollments', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganizationForm;
