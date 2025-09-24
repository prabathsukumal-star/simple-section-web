import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface CreateStudentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);

  const [formData, setFormData] = useState({
    // User data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    nic: '',
    birthCertificateNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    country: '',
    imageUrl: '',
    // Parent data
    fatherId: '',
    motherId: '',
    guardianId: '',
    // Student data
    studentId: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    bloodGroup: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      return;
    }

    const studentData = {
      user: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: 'STUDENT',
        dateOfBirth: date.format('YYYY-MM-DD'),
        gender: formData.gender,
        nic: formData.nic || undefined,
        birthCertificateNo: formData.birthCertificateNo || undefined,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        district: formData.district || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        imageUrl: formData.imageUrl || undefined,
        isActive: true
      },
      fatherId: formData.fatherId || null,
      motherId: formData.motherId || null,
      guardianId: formData.guardianId || null,
      studentId: formData.studentId,
      emergencyContact: formData.emergencyContact,
      medicalConditions: formData.medicalConditions || undefined,
      allergies: formData.allergies || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      isActive: true
    };

    onSubmit(studentData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-base font-medium">Date of Birth *</Label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select date of birth"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    maxDate={dayjs()}
                    minDate={dayjs('1900-01-01')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: {
                          '& .MuiInputBase-root': {
                            height: '48px',
                            fontSize: '16px'
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nic">NIC</Label>
                  <Input
                    id="nic"
                    value={formData.nic}
                    onChange={(e) => handleInputChange('nic', e.target.value)}
                    placeholder="e.g., 200512345678"
                  />
                </div>
                <div>
                  <Label htmlFor="birthCertificateNo">Birth Certificate No</Label>
                  <Input
                    id="birthCertificateNo"
                    value={formData.birthCertificateNo}
                    onChange={(e) => handleInputChange('birthCertificateNo', e.target.value)}
                    placeholder="e.g., BC-112233445"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Profile Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
              </div>
            </div>

            {/* Right Column - Address & Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>
              
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>

              <h3 className="text-lg font-semibold mt-4">Parent Information</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fatherId">Father ID</Label>
                  <Input
                    id="fatherId"
                    value={formData.fatherId}
                    onChange={(e) => handleInputChange('fatherId', e.target.value)}
                    placeholder="Father's user ID"
                  />
                </div>
                <div>
                  <Label htmlFor="motherId">Mother ID</Label>
                  <Input
                    id="motherId"
                    value={formData.motherId}
                    onChange={(e) => handleInputChange('motherId', e.target.value)}
                    placeholder="Mother's user ID"
                  />
                </div>
                <div>
                  <Label htmlFor="guardianId">Guardian ID</Label>
                  <Input
                    id="guardianId"
                    value={formData.guardianId}
                    onChange={(e) => handleInputChange('guardianId', e.target.value)}
                    placeholder="Guardian's user ID"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-4">Student Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    required
                    placeholder="e.g., STU2025025"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  placeholder="Enter any medical conditions..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Enter any allergies..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentForm;