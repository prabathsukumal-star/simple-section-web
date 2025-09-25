import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { ParentCreateData } from '@/api/parents.api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface CreateParentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const CreateParentForm = ({ onSubmit, onCancel, initialData }: CreateParentFormProps) => {
  const { currentInstituteId, user } = useAuth();
  
  // Check if user has permission (only SuperAdmin and InstituteAdmin)
  const userRole = user?.role;
  const hasPermission = userRole === 'SystemAdmin' || userRole === 'InstituteAdmin';
  
  const [formData, setFormData] = useState({
    // User Information
    firstName: initialData?.user?.firstName || '',
    lastName: initialData?.user?.lastName || '',
    email: initialData?.user?.email || '',
    password: initialData?.user?.password || 'parent123',
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
    imageUrl: initialData?.user?.imageUrl || '',
    isActive: initialData?.user?.isActive ?? true,
    
    // Parent Specific Information
    occupation: initialData?.occupation || '',
    workplace: initialData?.workplace || '',
    workPhone: initialData?.workPhone || '',
    educationLevel: initialData?.educationLevel || ''
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    initialData?.user?.dateOfBirth ? new Date(initialData.user.dateOfBirth) : null
  );

  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
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

    if (!formData.addressLine2.trim()) {
      toast.error('Address Line 2 is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedData: ParentCreateData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
          gender: formData.gender,
          nic: formData.nic,
          birthCertificateNo: formData.birthCertificateNo,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || 'N/A',
          city: formData.city,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          imageUrl: formData.imageUrl,
          isActive: formData.isActive,
          userType: 'PARENT'
        },
        occupation: formData.occupation,
        workplace: formData.workplace,
        workPhone: formData.workPhone || '0000000000',
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
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Only SuperAdmin and InstituteAdmin can create parents.</p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Create New Parent
        </h2>
        <p className="text-muted-foreground mt-2">Add a new parent to the institute</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="flex justify-center mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={formData.imageUrl} 
                      alt="Parent Image"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-base font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-base font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {!initialData && (
                <div>
                  <Label htmlFor="password" className="text-base font-medium">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone" className="text-base font-medium">Phone * (minimum 10 characters)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+94771234567"
                  required
                  className="h-12 text-base"
                />
              </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-base font-medium">Date of Birth *</Label>
                  <div className="mt-2">
                    <DatePicker 
                      value={dateOfBirth}
                      onChange={setDateOfBirth}
                      placeholder="Select date of birth"
                      style={{ width: '100%', height: '48px' }}
                    />
                  </div>
                </div>

              <div>
                <Label htmlFor="gender" className="text-base font-medium">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="h-12 text-base">
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
                <Label htmlFor="nic" className="text-base font-medium">NIC</Label>
                <Input
                  id="nic"
                  value={formData.nic}
                  onChange={(e) => handleInputChange('nic', e.target.value)}
                  placeholder="200123456789"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="birthCertificateNo" className="text-base font-medium">Birth Certificate No</Label>
                <Input
                  id="birthCertificateNo"
                  value={formData.birthCertificateNo}
                  onChange={(e) => handleInputChange('birthCertificateNo', e.target.value)}
                  placeholder="123456789"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-base font-medium">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional & Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary-foreground font-bold">2</span>
                </div>
                Professional & Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Professional Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="occupation" className="text-base font-medium">Occupation *</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workplace" className="text-base font-medium">Workplace</Label>
                    <Input
                      id="workplace"
                      value={formData.workplace}
                      onChange={(e) => handleInputChange('workplace', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workPhone" className="text-base font-medium">Work Phone * (minimum 10 characters)</Label>
                    <Input
                      id="workPhone"
                      value={formData.workPhone}
                      onChange={(e) => handleInputChange('workPhone', e.target.value)}
                      placeholder="+94771234567"
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="educationLevel" className="text-base font-medium">Education Level</Label>
                    <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange('educationLevel', value)}>
                      <SelectTrigger className="h-12 text-base">
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

              {/* Address Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Address Details</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-base font-medium">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-base font-medium">Address Line 2 *</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Required field"
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-base font-medium">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district" className="text-base font-medium">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province" className="text-base font-medium">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode" className="text-base font-medium">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-base font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-4 border-t">
                <div>
                  <Label htmlFor="isActive" className="text-base font-medium">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable this parent account</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-6 pt-8 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="h-12 px-8 text-base">
            {isLoading ? 'Creating...' : (initialData ? 'Update Parent' : 'Create Parent')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateParentForm;