import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { ParentCreateData } from '@/api/parents.api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
interface CreateParentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}
const CreateParentForm = ({
  onSubmit,
  onCancel,
  initialData
}: CreateParentFormProps) => {
  const {
    currentInstituteId,
    user
  } = useAuth();

  // Check if user has permission (only SuperAdmin and InstituteAdmin)
  const userRole = user?.role;
  const hasPermission = userRole === 'SystemAdmin' || userRole === 'InstituteAdmin';
  const [formData, setFormData] = useState({
    // User Information
    firstName: initialData?.user?.firstName || '',
    lastName: initialData?.user?.lastName || '',
    email: initialData?.user?.email || '',
    phone: initialData?.user?.phone || '',
    gender: initialData?.user?.gender || '',
    nic: initialData?.user?.nic || '',
    birthCertificateNo: initialData?.user?.birthCertificateNo || '',
    addressLine1: initialData?.user?.addressLine1 || '',
    addressLine2: initialData?.user?.addressLine2 || '',
    city: initialData?.user?.city || '',
    district: initialData?.user?.district || '',
    province: initialData?.user?.province || '',
    postalCode: initialData?.user?.postalCode || '',
    country: initialData?.user?.country || 'Sri Lanka',
    isActive: initialData?.user?.isActive ?? true,
    // Parent Specific Information
    occupation: initialData?.occupation || '',
    workplace: initialData?.workplace || '',
    workPhone: initialData?.workPhone || '',
    educationLevel: initialData?.educationLevel || ''
  });
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(initialData?.user?.dateOfBirth ? new Date(initialData.user.dateOfBirth) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    return token;
  };
  const getApiHeaders = () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission) {
      toast.error('You do not have permission to create parents');
      return;
    }

    // Validation
    if (formData.phone.length < 10) {
      toast.error('Phone number must be at least 10 characters');
      return;
    }
    if (formData.workPhone && formData.workPhone.length < 10) {
      toast.error('Work phone number must be at least 10 characters');
      return;
    }
    setIsLoading(true);
    try {
      const formattedData: ParentCreateData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          userType: 'PARENT',
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
          gender: formData.gender,
          nic: formData.nic,
          birthCertificateNo: formData.birthCertificateNo,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          isActive: formData.isActive
        },
        occupation: formData.occupation,
        workplace: formData.workplace,
        workPhone: formData.workPhone,
        educationLevel: formData.educationLevel,
        isActive: formData.isActive
      };
      console.log('Submitting parent data:', formattedData);
      if (!initialData) {
        const baseUrl = getBaseUrl();
        const headers = getApiHeaders();
        const response = await fetch(`${baseUrl}/parents`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedData)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create parent');
        }
        const result = await response.json();
        console.log('Parent created successfully:', result);
        toast.success('Parent created successfully!');
        onSubmit(formattedData);
      } else {
        onSubmit(formattedData);
      }
    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast.error(error?.message || 'Failed to create parent');
    } finally {
      setIsLoading(false);
    }
  };
  if (!hasPermission) {
    return <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-destructive mb-4">Access Denied</h3>
          <p className="text-muted-foreground mb-4">Only SuperAdmin and InstituteAdmin can create parents.</p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Create New Parent
        </h2>
        <p className="text-muted-foreground mt-2">Add a new parent to the institute</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
            <h3 className="text-4xl font-semibold flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              Personal Information
            </h3>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-base font-semibold">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required className="mt-2 h-12 text-base" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-base font-semibold">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required className="mt-2 h-12 text-base" placeholder="Enter last name" />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required className="mt-2 h-12 text-base" placeholder="Enter email address" />
              </div>


              <div>
                <Label htmlFor="phone" className="text-base font-semibold">Phone * (minimum 10 characters)</Label>
                <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="+94771234567" required className="mt-2 h-12 text-base" />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-base font-semibold">Date of Birth *</Label>
                <div className="mt-2">
                  <div className="relative">
                    <Input type="date" value={dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : ""} onChange={e => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setDateOfBirth(date);
                  }} className="h-12 text-base pr-12" placeholder="mm/dd/yyyy" />
                    
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="gender" className="text-base font-semibold">Gender *</Label>
                <Select value={formData.gender} onValueChange={value => handleInputChange('gender', value)}>
                  <SelectTrigger className="mt-2 h-12 text-base">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nic" className="text-base font-semibold">NIC</Label>
                <Input id="nic" value={formData.nic} onChange={e => handleInputChange('nic', e.target.value)} placeholder="200123456789" className="mt-2 h-12 text-base" />
              </div>

              <div>
                <Label htmlFor="birthCertificateNo" className="text-base font-semibold">Birth Certificate No</Label>
                <Input id="birthCertificateNo" value={formData.birthCertificateNo} onChange={e => handleInputChange('birthCertificateNo', e.target.value)} placeholder="123456789" className="mt-2 h-12 text-base" />
              </div>

            </div>
          </div>

          {/* Professional & Address Information Section */}
          <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 p-6 rounded-lg border">
            <h3 className="text-4xl font-semibold flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-bold">2</span>
              </div>
              Professional & Address Information
            </h3>
            
            {/* Professional Information Subsection */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-primary border-b pb-2">Professional Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="occupation" className="text-base font-semibold">Occupation *</Label>
                  <Input id="occupation" value={formData.occupation} onChange={e => handleInputChange('occupation', e.target.value)} required className="mt-2 h-12 text-base" placeholder="Enter occupation" />
                </div>

                <div>
                  <Label htmlFor="workplace" className="text-base font-semibold">Workplace</Label>
                  <Input id="workplace" value={formData.workplace} onChange={e => handleInputChange('workplace', e.target.value)} className="mt-2 h-12 text-base" placeholder="Enter workplace" />
                </div>

                <div>
                  <Label htmlFor="workPhone" className="text-base font-semibold">Work Phone (minimum 10 characters)</Label>
                  <Input id="workPhone" value={formData.workPhone} onChange={e => handleInputChange('workPhone', e.target.value)} placeholder="+94771234567" className="mt-2 h-12 text-base" />
                </div>

                <div>
                  <Label htmlFor="educationLevel" className="text-base font-semibold">Education Level</Label>
                  <Select value={formData.educationLevel} onValueChange={value => handleInputChange('educationLevel', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary Education">Primary Education</SelectItem>
                      <SelectItem value="Secondary Education">Secondary Education</SelectItem>
                      <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information Subsection */}
            <div className="space-y-6 mt-8">
              <h4 className="text-lg font-semibold text-primary border-b pb-2">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="addressLine1" className="text-base font-semibold">Address Line 1</Label>
                  <Input id="addressLine1" value={formData.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} className="mt-2 h-12 text-base" placeholder="Street address" />
                </div>

                <div>
                  <Label htmlFor="addressLine2" className="text-base font-semibold">Address Line 2</Label>
                  <Input id="addressLine2" value={formData.addressLine2} onChange={e => handleInputChange('addressLine2', e.target.value)} className="mt-2 h-12 text-base" placeholder="Area, landmark" />
                </div>

                <div>
                  <Label htmlFor="city" className="text-base font-semibold">City</Label>
                  <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="mt-2 h-12 text-base" placeholder="Enter city" />
                </div>

                <div>
                  <Label htmlFor="district" className="text-base font-semibold">District</Label>
                  <Input id="district" value={formData.district} onChange={e => handleInputChange('district', e.target.value)} className="mt-2 h-12 text-base" placeholder="Enter district" />
                </div>

                <div>
                  <Label htmlFor="province" className="text-base font-semibold">Province</Label>
                  <Input id="province" value={formData.province} onChange={e => handleInputChange('province', e.target.value)} className="mt-2 h-12 text-base" placeholder="Enter province" />
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-base font-semibold">Postal Code</Label>
                  <Input id="postalCode" value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} className="mt-2 h-12 text-base" placeholder="Enter postal code" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                  <Input id="country" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} className="mt-2 h-12 text-base" placeholder="Sri Lanka" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-12 px-8 text-base">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12 px-8 text-base">
            {isLoading ? 'Creating...' : initialData ? 'Update Parent' : 'Create Parent'}
          </Button>
        </div>
      </form>
    </div>;
};
export default CreateParentForm;